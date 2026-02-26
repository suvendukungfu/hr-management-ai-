import { plannerMemoryStore, type RiskLevel, type PlannerMemoryState } from "../state/plannerMemory.js";

export interface PlannerNode {
  id: string;
  name: string;
  status: 'ACTIVE' | 'RUNNING' | 'WAITING' | 'IDLE' | 'READY' | 'COMPLETED';
  level: number;
  type: 'manager' | 'worker' | 'guard' | 'utility';
  isInjected?: boolean;
}

export interface PlannerEdge {
  from: string;
  to: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PlannerGraph {
  nodes: PlannerNode[];
  edges: PlannerEdge[];
}

type Listener = (graph: PlannerGraph) => void;

export class SelfEvolvingPlanner {
  private graph: PlannerGraph;
  private listeners: Set<Listener> = new Set();
  
  constructor() {
    this.graph = this.getInitialGraph();
    
    // Listen to memory changes to evolve the graph
    plannerMemoryStore.subscribe((state: PlannerMemoryState) => {
      this.evaluateEvolutionRules(state.confidenceIndex, state.riskLevel);
    });
  }

  private getInitialGraph(): PlannerGraph {
    return {
      nodes: [
        { id: "mgr", name: "Manager Planner", status: "ACTIVE", level: 0, type: "manager" },
        { id: "rec", name: "Recruiter Agent", status: "RUNNING", level: 1, type: "worker" },
        { id: "ana", name: "Analytics Agent", status: "WAITING", level: 1, type: "utility" },
        { id: "sch", name: "Scheduler Agent", status: "READY", level: 2, type: "worker" },
      ],
      edges: [
        { from: "mgr", to: "rec", priority: "HIGH" },
        { from: "mgr", to: "ana", priority: "MEDIUM" },
        { from: "rec", to: "sch", priority: "HIGH" },
      ]
    };
  }

  private emit() {
    // Dispatch global CustomEvent for the Live Event Stream
    window.dispatchEvent(new CustomEvent('antigravity:graph_updated', {
      detail: { timestamp: Date.now() }
    }));
    this.listeners.forEach(l => l(this.graph));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // Immediate call on subscribe
    listener(this.graph);
    return () => this.listeners.delete(listener);
  }

  getGraph() {
    return this.graph;
  }

  // --- Graph Mutations ---
  
  addNode(node: PlannerNode, incomingFrom: string[], outgoingTo: string[]) {
    // Avoid duplicates
    if (this.graph.nodes.some(n => n.id === node.id)) return;
    
    this.graph.nodes.push({ ...node, isInjected: true });
    
    incomingFrom.forEach(fromId => {
      this.graph.edges.push({ from: fromId, to: node.id, priority: "HIGH" });
    });
    
    outgoingTo.forEach(toId => {
      this.graph.edges.push({ from: node.id, to: toId, priority: "HIGH" });
    });

    this.emit();
  }

  removeNode(id: string) {
    this.graph.nodes = this.graph.nodes.filter(n => n.id !== id);
    this.graph.edges = this.graph.edges.filter(e => e.from !== id && e.to !== id);
    this.emit();
  }

  reorderEdges(newEdges: PlannerEdge[]) {
    this.graph.edges = newEdges;
    this.emit();
  }

  updateNodeStatus(id: string, status: PlannerNode['status']) {
    const node = this.graph.nodes.find(n => n.id === id);
    if (node && node.status !== status) {
      node.status = status;
      this.emit();
    }
  }

  // --- Evolution Logic ---

  private evaluateEvolutionRules(confidence: number, risk: RiskLevel) {
    // Rule 1: Inject Bias Guard if confidence drops or risk is elevated
    const hasBiasGuard = this.graph.nodes.some(n => n.id === 'bias');
    
    if ((confidence < 90 || risk === 'HIGH' || risk === 'CRITICAL') && !hasBiasGuard) {
      plannerMemoryStore.setStrategy("High-Risk Mitigation: Bias Guard Injected");
      
      // Inject Bias Agent between Recruiter and Scheduler
      this.addNode(
        { id: "bias", name: "Bias Detection Agent", status: "WAITING", level: 1, type: "guard" },
        ["rec"], // from recruiter
        ["sch"]  // to scheduler
      );
      
      // Remove original direct edge from Recruiter to Scheduler
      this.graph.edges = this.graph.edges.filter(e => !(e.from === "rec" && e.to === "sch"));
      
      // Push Scheduler level down
      const sch = this.graph.nodes.find(n => n.id === 'sch');
      if (sch) sch.level = 2;
      
      const bias = this.graph.nodes.find(n => n.id === 'bias');
      if (bias) bias.level = 1;
      
      this.emit();
      
      // Dispatch strategy changed for event stream
      window.dispatchEvent(new CustomEvent('antigravity:strategy_changed', {
        detail: { reason: `Confidence dropped to ${confidence}%. Bias Guard injected.` }
      }));
    }

    // Rule 2: If everything is super stable, remove Bias Guard to optimize latency
    if (confidence >= 95 && risk === 'LOW' && hasBiasGuard) {
      plannerMemoryStore.setStrategy("Speed-Optimized Execution");
      this.removeNode("bias");
      // Restore direct edge
      this.graph.edges.push({ from: "rec", to: "sch", priority: "HIGH" });
      this.emit();
      
      window.dispatchEvent(new CustomEvent('antigravity:strategy_changed', {
        detail: { reason: `System stable (95%+ confidence). Removing Bias Guard to optimize latency.` }
      }));
    }
  }
}

// Singleton for UI
export const selfEvolvingPlanner = new SelfEvolvingPlanner();
