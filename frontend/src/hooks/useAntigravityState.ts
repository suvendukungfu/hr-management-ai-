import { useState, useEffect } from "react";
import { useMissionControl } from "./useMissionControl";
import { plannerMemoryStore, PlannerMemoryState } from "../antigravity/state/plannerMemory";
import { selfEvolvingPlanner, PlannerGraph } from "../antigravity/planners/selfEvolvingPlanner";

export function useAntigravityState() {
  // Inherit standard API bindings
  const mc = useMissionControl();

  // Unified Antigravity state
  const [memory, setMemory] = useState<PlannerMemoryState>(plannerMemoryStore.getState());
  const [graph, setGraph] = useState<PlannerGraph>(selfEvolvingPlanner.getGraph());
  const [plannerEvents, setPlannerEvents] = useState<{ time: string, msg: string, type: string }[]>([]);

  useEffect(() => {
    // 1. Subscribe to memory
    const unsubMemory = plannerMemoryStore.subscribe(setMemory);
    
    // 2. Subscribe to graph evolution
    const unsubGraph = selfEvolvingPlanner.subscribe(setGraph);

    // 3. Listen to global DOM events for strategy changes
    const onStrategyChanged = (e: any) => {
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      setPlannerEvents(prev => [{ time: timeStr, msg: e.detail.reason, type: 'reflection' }, ...prev].slice(0, 50));
    };

    window.addEventListener('antigravity:strategy_changed', onStrategyChanged);

    return () => {
      unsubMemory();
      unsubGraph();
      window.removeEventListener('antigravity:strategy_changed', onStrategyChanged);
    };
  }, []);

  return {
    ...mc, // triggerApi, systemState, simResults
    evolvingGraph: graph,
    memory,
    plannerEvents,
    // Actions for views to trigger explicitly if needed
    triggerRiskEvent: () => plannerMemoryStore.setRiskLevel('HIGH'),
    triggerConfidenceDrop: () => plannerMemoryStore.updateConfidence(84),
    triggerConfidenceSurge: () => plannerMemoryStore.updateConfidence(98),
    addReflection: (score: number, note: string, agent: string) => {
      plannerMemoryStore.addReflectionFeedback({ agent, score, note });
      // Minor random fluctuation in overall confidence based on this reflection
      const currentConf = plannerMemoryStore.getState().confidenceIndex;
      const swing = score > 90 ? +1 : -2;
      plannerMemoryStore.updateConfidence(Math.min(100, Math.max(0, currentConf + swing)));
    }
  };
}
