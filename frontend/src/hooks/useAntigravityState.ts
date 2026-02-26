import { useState, useEffect } from "react";
import { useMissionControl } from "./useMissionControl.js";
import type { PlannerMemoryState } from "../antigravity/state/plannerMemory.js";

export function useAntigravityState() {
  const mc = useMissionControl();

  const [memory, setMemory] = useState<PlannerMemoryState>({
    goal: "N/A", status: "WAITING", riskLevel: "LOW", confidenceIndex: 100,
    startTime: null, activeAgents: [], memoryRefs: [],
    recentFeedback: []
  });

  const [graph, setGraph] = useState<any[]>([
    { id: "source", label: "Candidate Sourcing", status: "pending" },
    { id: "enrich", label: "Profile Enrichment", status: "pending" },
    { id: "evaluate", label: "Skill Evaluation", status: "pending" },
    { id: "schedule", label: "Interview Coordination", status: "pending" }
  ]);

  const [plannerEvents, setPlannerEvents] = useState<{ time: string, msg: string, type: string }[]>([]);

  useEffect(() => {
    if (mc.systemState) {
      setMemory(prev => ({
        ...prev,
        goal: mc.systemState.current_goal || "Awaiting Orders",
        confidenceIndex: mc.systemState.confidence_index,
        status: mc.systemState.status
      }));
    }
  }, [mc.systemState]);

  useEffect(() => {
    // Process new incoming events
    if (mc.events.length > 0) {
      const latest = mc.events[mc.events.length - 1];
      if (!latest) return;
      
      if (latest.topic === "planner:graph_update") {
        setGraph(latest.data as any[]);
      }
      
      if (latest.topic.startsWith("reflection:")) {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        setPlannerEvents(prev => [{ time: timeStr, msg: String(latest.data), type: "reflection" }, ...prev].slice(0, 50));
      }
      
      if (latest.topic.startsWith("planner:strategy") || latest.topic.startsWith("system:error")) {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        setPlannerEvents(prev => [{ time: timeStr, msg: String(latest.data), type: latest.topic.split(":")[1] || "unknown" }, ...prev].slice(0, 50));
      }
    }
  }, [mc.events]);

  return {
    ...mc, 
    evolvingGraph: graph,
    memory,
    plannerEvents,
    triggerRiskEvent: () => console.warn("Risk event UI bind not implemented remotely"),
    triggerConfidenceDrop: () => console.warn("Confidence UI bind not implemented remotely"),
    triggerConfidenceSurge: () => console.warn("Confidence UI bind not implemented remotely"),
    addReflection: (score: number, note: string, agent: string) => console.warn("Reflection manual submit not implemented remotely", { score, note, agent })
  };
}
