import { useSyncExternalStore } from "react";

const API_BASE = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws/events";

type WsEvent = {
  topic: string;
  data: unknown;
  timestamp?: number;
  trace_id?: string;
  source?: string;
  phase?: string;
};

type SelfEvalScores = {
  success_score: number;
  efficiency_score: number;
  safety_score: number;
  learning_value: number;
  aggregate: number;
  timestamp?: number;
} | null;

type FrontendMetrics = {
  event_latency_ms: number;
  render_batch_count: number;
  ws_reconnect_attempts: number;
};

type MissionControlState = {
  systemState: any;
  events: WsEvent[];
  simResults: any;
  plannerReasoningStream: Array<{ message: string; phase?: string | undefined; timestamp: number }>;
  executorOutputStream: Array<{ chunk: string; stream: string; timestamp: number }>;
  reflectionSummaries: Array<{ summary: string; timestamp: number }>;
  memorySnapshots: Array<{ goal_id?: string | undefined; hits: unknown[]; timestamp: number }>;
  selfEvalScores: SelfEvalScores;
  frontendMetrics: FrontendMetrics;
};

export type MissionControlApi = MissionControlState & {
  triggerApi: (path: string, body?: unknown) => Promise<void>;
  refreshState: () => Promise<void>;
};

type Listener = () => void;

const INITIAL_STATE: MissionControlState = {
  systemState: null,
  events: [],
  simResults: null,
  plannerReasoningStream: [],
  executorOutputStream: [],
  reflectionSummaries: [],
  memorySnapshots: [],
  selfEvalScores: null,
  frontendMetrics: {
    event_latency_ms: 0,
    render_batch_count: 0,
    ws_reconnect_attempts: 0,
  },
};

class MissionControlStore {
  private state: MissionControlState = INITIAL_STATE;
  private listeners = new Set<Listener>();
  private ws: WebSocket | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private mountedSubscribers = 0;
  private active = false;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    this.mountedSubscribers += 1;
    if (!this.active) {
      this.start();
    }
    return () => {
      this.listeners.delete(listener);
      this.mountedSubscribers = Math.max(0, this.mountedSubscribers - 1);
      if (this.mountedSubscribers === 0) {
        this.stop();
      }
    };
  };

  getSnapshot = (): MissionControlState => this.state;

  fetchState = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/system/state`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      this.patchState({ systemState: data });
    } catch {
      // Network errors are expected while backend is offline.
    }
  };

  triggerApi = async (path: string, body: unknown = null): Promise<void> => {
    const opts: RequestInit = { method: "POST" };
    if (body !== null) {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
    await fetch(`${API_BASE}${path}`, opts);
    await this.fetchState();
  };

  private start() {
    if (this.active) {
      return;
    }
    this.active = true;
    void this.fetchState();
    this.pollTimer = setInterval(() => {
      void this.fetchState();
    }, 3000);
    this.connectWs();
  }

  private stop() {
    this.active = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  private connectWs() {
    if (!this.active || this.ws) {
      return;
    }

    const socket = new WebSocket(WS_URL);
    this.ws = socket;

    socket.onopen = () => {
      this.reconnectAttempts = 0;
    };

    socket.onmessage = (event: MessageEvent) => {
      this.handleEvent(event.data);
    };

    socket.onclose = () => {
      if (this.ws === socket) {
        this.ws = null;
      }
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (!this.active || this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts += 1;
    const cappedAttempt = Math.min(this.reconnectAttempts, 6);
    const base = Math.min(1000 * 2 ** cappedAttempt, 30000);
    const jitter = Math.floor(Math.random() * 300);
    const delayMs = base + jitter;

    this.patchState({
      frontendMetrics: {
        ...this.state.frontendMetrics,
        ws_reconnect_attempts: this.reconnectAttempts,
      },
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWs();
    }, delayMs);
  }

  private handleEvent(payload: string) {
    let parsed: WsEvent;
    try {
      parsed = JSON.parse(payload) as WsEvent;
    } catch {
      return;
    }

    const receivedAt = Date.now();
    const emittedAt = typeof parsed.timestamp === "number" ? parsed.timestamp : receivedAt;
    const latency = Math.max(0, receivedAt - emittedAt);

    const events = this.pushBounded(this.state.events, parsed, 800);
    let nextState: Partial<MissionControlState> = {
      events,
      frontendMetrics: {
        event_latency_ms: latency,
        render_batch_count: this.state.frontendMetrics.render_batch_count + 1,
        ws_reconnect_attempts: this.state.frontendMetrics.ws_reconnect_attempts,
      },
    };

    if (parsed.topic === "simulation:complete") {
      nextState = { ...nextState, simResults: parsed.data };
    }

    if (parsed.topic === "planner:reasoning") {
      const message =
        typeof parsed.data === "string"
          ? parsed.data
          : JSON.stringify(parsed.data);
      nextState = {
        ...nextState,
        plannerReasoningStream: this.pushBounded(
          this.state.plannerReasoningStream,
          { message, phase: parsed.phase, timestamp: receivedAt },
          200
        ),
      };
    }

    if (parsed.topic === "TOOL_STREAM" && parsed.data && typeof parsed.data === "object") {
      const toolData = parsed.data as { chunk?: string; stream?: string };
      nextState = {
        ...nextState,
        executorOutputStream: this.pushBounded(
          this.state.executorOutputStream,
          {
            chunk: toolData.chunk ?? "",
            stream: toolData.stream ?? "stdout",
            timestamp: receivedAt,
          },
          600
        ),
      };
    }

    if (parsed.topic.startsWith("reflection:")) {
      const summary =
        typeof parsed.data === "string" ? parsed.data : JSON.stringify(parsed.data);
      nextState = {
        ...nextState,
        reflectionSummaries: this.pushBounded(
          this.state.reflectionSummaries,
          { summary, timestamp: receivedAt },
          200
        ),
      };
    }

    if (parsed.topic === "memory:retrieval_snapshot" && parsed.data && typeof parsed.data === "object") {
      const data = parsed.data as { goal_id?: string; hits?: unknown[] };
      nextState = {
        ...nextState,
        memorySnapshots: this.pushBounded(
          this.state.memorySnapshots,
          { goal_id: data.goal_id, hits: data.hits ?? [], timestamp: receivedAt },
          100
        ),
      };
    }

    if (parsed.topic === "SELF_EVAL_READY" && parsed.data && typeof parsed.data === "object") {
      nextState = {
        ...nextState,
        selfEvalScores: parsed.data as NonNullable<SelfEvalScores>,
      };
    }

    if (parsed.topic.startsWith("planner:")) {
      void this.fetchState();
    }

    this.patchState(nextState);
  }

  private patchState(partial: Partial<MissionControlState>) {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener();
    }
  }

  private pushBounded<T>(current: T[], value: T, maxItems: number): T[] {
    const next = [...current, value];
    if (next.length <= maxItems) {
      return next;
    }
    return next.slice(next.length - maxItems);
  }
}

export const missionControlStore = new MissionControlStore();

export function useMissionControl(): MissionControlApi {
  const state = useSyncExternalStore(
    missionControlStore.subscribe,
    missionControlStore.getSnapshot
  );

  return {
    ...state,
    triggerApi: missionControlStore.triggerApi,
    refreshState: missionControlStore.fetchState,
  };
}
