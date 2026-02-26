import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface SimulationPanelProps {
  className?: string;
}

export function SimulationPanel({ className }: SimulationPanelProps) {
  const { triggerApi, simResults, systemState } = useAntigravityState();
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (systemState?.status === "SIMULATING") setIsRunning(true);
    else if (systemState?.status === "ACTIVE" || systemState?.status === "IDLE") setIsRunning(false);
  }, [systemState?.status]);

  const progress = systemState?.simulation_progress || (isRunning ? 45 : 0);

  const metrics = simResults ? [
    { id: "m1", name: "CANDIDATES", value: simResults.total_processed || "0", unit: "TOTAL" },
    { id: "m2", name: "MATCH RATE", value: simResults.avg_match_rate || "0", unit: "%" },
    { id: "m3", name: "TIME TO HIRE", value: "12", unit: "DAYS" },
    { id: "m4", name: "BIAS ALERT", value: simResults.bias_incidents || "0", unit: "INCIDENTS" },
  ] : [
    { id: "m1", name: "CANDIDATES", value: "1,204", unit: "TOTAL" },
    { id: "m2", name: "MATCH RATE", value: "94.2", unit: "%" },
    { id: "m3", name: "TIME TO HIRE", value: "12", unit: "DAYS" },
    { id: "m4", name: "BIAS ALERT", value: "0", unit: "INCIDENTS" },
  ];

  const handleToggle = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      triggerApi('/simulation/run', { goal: systemState?.current_goal || "UI Simulation Trigger" });
    } else {
      triggerApi('/simulation/stop');
    }
  };

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0, color: theme.colors.text }}>
          SYSTEM SIMULATION
        </h3>
        <button 
          onClick={handleToggle}
          style={{ 
            background: isRunning ? "transparent" : theme.colors.running, 
            color: isRunning ? theme.colors.danger : theme.colors.bg,
            border: isRunning ? `1px solid ${theme.colors.danger}` : "none",
            fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 700, padding: "8px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 
          }}
        >
          {isRunning ? "■ HALT SIMULATION" : "▶ START SIMULATION"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {metrics.map((m) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px", background: theme.colors.sidebar, border: `1px solid ${theme.colors.panelBorder}` }}>
            <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5 }}>
              // {m.name}
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-secondary)", fontSize: 24, fontWeight: 700, color: theme.colors.text }}>
                {m.value}
              </span>
              <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, color: theme.colors.muted }}>
                {m.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5 }}>// PROGRESS</span>
          <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: isRunning ? theme.colors.running : theme.colors.text }}>{progress}%</span>
        </div>
        <div style={{ width: "100%", height: 2, background: theme.colors.sidebar, position: "relative" }}>
          <div 
            style={{ 
              position: "absolute", left: 0, top: 0, bottom: 0, 
              width: `${progress}%`, background: isRunning ? theme.colors.running : theme.colors.muted,
              boxShadow: isRunning ? `0 0 10px ${theme.colors.running}80` : "none",
              transition: "width 0.5s ease"
            }} 
          />
        </div>
      </div>

      {isRunning && (
        <div style={{ 
          marginTop: 8, padding: "12px 16px", background: `${theme.colors.running}10`, border: `1px solid ${theme.colors.running}40`,
          fontFamily: "var(--font-primary)", fontSize: 11, color: theme.colors.running, display: "flex", alignItems: "center", gap: 12
        }} className="animate-fade-in-up">
          <span style={{ width: 6, height: 6, background: theme.colors.running, boxShadow: `0 0 8px ${theme.colors.running}80` }} className="animate-pulse-glow" />
          SIMULATION_PARAMETERS_ACTIVE
        </div>
      )}
    </Card>
  );
}
