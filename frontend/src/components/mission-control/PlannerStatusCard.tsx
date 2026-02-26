import React from "react";
import { cn } from "../../lib/utils.js";

interface PlannerStatusCardProps {
  status: "ACTIVE" | "IDLE" | "ERROR";
  goal: string;
  riskLevel: string;
  className?: string;
}

export function PlannerStatusCard({ status, goal, riskLevel, className }: PlannerStatusCardProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover animate-fade-in-up", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">God-Mode Planner</h3>
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-medium animate-pulse-glow",
          status === "ACTIVE" ? "bg-primary/20 text-primary" :
          status === "ERROR" ? "bg-destructive/20 text-destructive" :
          "bg-muted/50 text-muted-foreground"
        )}>
          {status}
        </span>
      </div>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Current Goal</p>
          <p className="font-medium text-foreground">{goal}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">System Risk Level</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{riskLevel}</span>
            <div className="flex-1 progress-bar">
              <div 
                className="progress-bar-fill bg-primary" 
                style={{ width: riskLevel === "Low" ? "25%" : riskLevel === "Medium" ? "50%" : "85%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
