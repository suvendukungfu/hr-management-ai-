import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface PlannerGraphProps {
  nodes: { id: string; label: string; status: "completed" | "active" | "pending" }[];
  className?: string;
}

export function PlannerGraph({ nodes, className }: PlannerGraphProps) {
  const { events } = useAntigravityState();
  const [activeNodes, setActiveNodes] = useState<string[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      if (latestEvent && (latestEvent.topic === "agent:spawn" || latestEvent.topic === "agent_started")) {
        const agentName = latestEvent.data as string;
        if (!agentName) return;
        const namePrefix = agentName.toLowerCase().split(' ')[0] || "";
        const mappedNode = nodes.find(n => 
          n.label.toLowerCase().includes(namePrefix) ||
          (agentName.includes("Recruiter") && n.label.includes("Source")) ||
          (agentName.includes("Scheduler") && n.label.includes("Schedule")) ||
          (agentName.includes("Evaluator") && n.label.includes("Evaluate"))
        );

        if (mappedNode) {
          setActiveNodes(prev => [...prev, mappedNode.id]);
          setTimeout(() => {
            setActiveNodes(prev => prev.filter(id => id !== mappedNode.id));
          }, 2000);
        }
      }
    }
  }, [events, nodes]);

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0, color: theme.colors.text }}>
          PLANNER GRAPH TOPOLOGY
        </h3>
        <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 1 }}>
          // EXECUTION_PATH
        </span>
      </div>
      <div style={{ 
        position: "relative", height: 260, border: `1px solid ${theme.colors.panelBorder}`, display: "flex", alignItems: "center", justifyContent: "center", background: theme.colors.sidebar, overflow: "hidden" 
      }}>
        {/* Graph Dot Matrix Background */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${theme.colors.running} 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "center", width: "100%", zIndex: 10, padding: "0 20px" }} className="animate-fade-in-up">
          {nodes.map((node, i) => {
            const isPulsing = activeNodes.includes(node.id) || node.status === "active";
            const isCompleted = node.status === "completed";
            const nodeColor = isPulsing ? theme.colors.running : isCompleted ? theme.colors.text : theme.colors.muted;
            
            return (
              <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
                <div className={cn(isPulsing && "animate-pulse-glow")} style={{ 
                  padding: "10px 16px", background: theme.colors.panel, border: `1px solid ${isPulsing ? theme.colors.running : theme.colors.panelBorder}`,
                  boxShadow: isPulsing ? `0 0 15px ${theme.colors.running}40` : "none", transition: "all 0.3s ease" 
                }}>
                  <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, color: nodeColor, letterSpacing: 1 }}>
                    {node.label.toUpperCase()}
                  </span>
                </div>
                {i < nodes.length - 1 && (
                  <div style={{ width: 24, height: 1, background: isCompleted ? theme.colors.text : theme.colors.panelBorder, margin: "0 8px" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
