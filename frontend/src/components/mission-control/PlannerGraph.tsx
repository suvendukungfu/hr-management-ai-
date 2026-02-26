import React from "react";
import { cn } from "../../lib/utils.js";

interface PlannerGraphProps {
  nodes: { id: string; label: string; status: "completed" | "active" | "pending" }[];
  className?: string;
}

export function PlannerGraph({ nodes, className }: PlannerGraphProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <h3 className="font-semibold text-lg mb-4">Planner Graph</h3>
      <div className="relative h-64 border rounded-md border-dashed border-border flex items-center justify-center bg-background/50 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="flex flex-wrap gap-4 items-center justify-center w-full z-10 px-4 animate-fade-in-up">
          {nodes.map((node, i) => (
            <div key={node.id} className="flex items-center">
              <div className={cn(
                "px-4 py-2 rounded-lg border text-sm font-medium transition-colors shadow-sm",
                node.status === "completed" ? "bg-primary/10 border-primary text-primary" :
                node.status === "active" ? "bg-info/10 border-info text-info animate-pulse-glow" :
                "bg-muted/10 border-border text-muted-foreground"
              )}>
                {node.label}
              </div>
              {i < nodes.length - 1 && (
                <div className="w-8 h-px bg-border mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
