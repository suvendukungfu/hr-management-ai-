import React from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { StatusDot } from "../StatusDot.js";
import { statusColor } from "../../theme.js";

interface AgentControlPanelProps {
  className?: string;
}

export function AgentControlPanel({ className }: AgentControlPanelProps) {
  const { systemState, triggerApi } = useAntigravityState();

  const agents = [
    { id: "1", name: "Recruiter Agent", role: "Sourcing & Outreach", status: systemState?.agents?.["Recruiter Agent"] as any || "RUNNING" },
    { id: "2", name: "Scheduler Agent", role: "Interview Logistics", status: systemState?.agents?.["Scheduler Agent"] as any || "WAITING" },
    { id: "3", name: "Analytics Agent", role: "Data Processing", status: systemState?.agents?.["Analytics Agent"] as any || "IDLE" },
    { id: "4", name: "Bias Detection Agent", role: "Fairness Monitoring", status: systemState?.agents?.["Bias Detection Agent"] as any || "READY" },
  ];

  return (
    <div className={cn("bg-card text-card-foreground rounded-lg p-6 border border-border card-hover", className)}>
      <h3 className="font-semibold text-lg mb-4">Agent Control Panel</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-4 rounded-md border border-border bg-background/50 hover:bg-background/80 transition-colors">
            <div>
              <p className="font-medium text-foreground">{agent.name}</p>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <StatusDot state={agent.status} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: statusColor(agent.status) }}>
                  {agent.status}
                </span>
              </div>
              {agent.name === "Recruiter Agent" && (
                <button 
                  onClick={() => triggerApi('/agent/recruiter/trigger')}
                  className="px-2 py-1 text-xs rounded border border-border hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  Trigger
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
