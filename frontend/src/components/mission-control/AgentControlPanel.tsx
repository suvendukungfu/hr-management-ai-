import React from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { Card } from "../Layout.js";
import { statusColor, theme } from "../../theme.js";

interface AgentControlPanelProps {
  className?: string;
}

export function AgentControlPanel({ className }: AgentControlPanelProps) {
  const { systemState, triggerApi } = useAntigravityState();

  const agents = [
    { id: "1", name: "Recruiter Agent", role: "Sourcing & Outreach", status: systemState?.agents?.["Recruiter Agent"]?.status || "RUNNING" },
    { id: "2", name: "Scheduler Agent", role: "Interview Logistics", status: systemState?.agents?.["Scheduler Agent"]?.status || "WAITING" },
    { id: "3", name: "Analytics Agent", role: "Data Processing", status: systemState?.agents?.["Analytics Agent"]?.status || "IDLE" },
    { id: "4", name: "Bias Detection Agent", role: "Fairness Monitoring", status: systemState?.agents?.["Bias Detection Agent"]?.status || "READY" },
  ];

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0, color: theme.colors.text }}>
          AGENT CONTROL MATRIX
        </h3>
        <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 1 }}>
          // ACTIVE_THREADS
        </span>
      </div>
      
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {agents.map((agent) => (
          <div key={agent.id} style={{ 
            display: "flex", alignItems: "center", justifyContent: "space-between", 
            padding: "16px", background: theme.colors.sidebar, border: `1px solid ${theme.colors.panelBorder}` 
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontFamily: "var(--font-primary)", fontSize: 12, fontWeight: 600, color: theme.colors.text }}>
                {agent.name.toUpperCase()}
              </p>
              <p style={{ fontFamily: "var(--font-primary)", fontSize: 10, color: theme.colors.muted }}>
                {agent.role.toUpperCase()}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ 
                  width: 6, height: 6, background: statusColor(agent.status), 
                  boxShadow: `0 0 8px ${statusColor(agent.status)}80` 
                }} />
                <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 700, color: statusColor(agent.status), letterSpacing: 1 }}>
                  {agent.status}
                </span>
              </div>
              {agent.name === "Recruiter Agent" && (
                <button 
                  onClick={() => triggerApi('/agent/recruiter/trigger', { goal: "Force rerun requested via UI" })}
                  style={{ 
                    fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 700, background: "transparent", 
                    color: theme.colors.text, border: `1px solid ${theme.colors.panelBorder}`, padding: "6px 12px", cursor: "pointer" 
                  }}
                >
                  RERUN
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
