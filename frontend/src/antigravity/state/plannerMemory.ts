export interface ReflectionFeedback {
  agent: string;
  score: number;
  note: string;
  timestamp: number;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PlannerMemoryState {
  confidenceIndex: number;
  confidenceHistory?: number[];
  riskLevel: RiskLevel;
  reflectionLogs?: ReflectionFeedback[];
  strategy?: string;
  goal?: string;
  status?: string;
  startTime?: number | null;
  activeAgents?: string[];
  memoryRefs?: string[];
  recentFeedback?: any[];
}

type Listener = (state: PlannerMemoryState) => void;

class PlannerMemory {
  private state: PlannerMemoryState = {
    confidenceIndex: 92,
    confidenceHistory: [85, 87, 88, 86, 90, 89, 91, 92],
    riskLevel: 'LOW',
    reflectionLogs: [],
    strategy: 'Standard Execution Pattern',
  };

  private listeners: Set<Listener> = new Set();

  getState() {
    return this.state;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = { ...this.state };
    this.listeners.forEach((l) => l(currentState));
  }

  // --- Mutators ---

  updateConfidence(score: number) {
    this.state.confidenceIndex = score;
    this.state.confidenceHistory = [...(this.state.confidenceHistory || []), score].slice(-20); // Keep last 20
    this.notify();
  }

  addReflectionFeedback(feedback: Omit<ReflectionFeedback, 'timestamp'>) {
    this.state.reflectionLogs = [
      { ...feedback, timestamp: Date.now() },
      ...(this.state.reflectionLogs || []),
    ].slice(0, 50); // Keep last 50
    this.notify();
  }

  setRiskLevel(risk: RiskLevel) {
    this.state.riskLevel = risk;
    this.notify();
  }

  setStrategy(strategy: string) {
    this.state.strategy = strategy;
    this.notify();
  }
}

// Singleton instance for the frontend
export const plannerMemoryStore = new PlannerMemory();
