import React from "react";
import { cn } from "../../lib/utils.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface PlannerStatusCardProps {
  status: "ACTIVE" | "IDLE" | "ERROR";
  goal: string;
  riskLevel: string;
  className?: string;
}

export function PlannerStatusCard({ status, goal, riskLevel, className }: PlannerStatusCardProps) {
  const isError = status === "ERROR";
  const accentColor = isError ? theme.colors.danger : theme.colors.running;

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0 }}>
          GOD-MODE PLANNER
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: `${accentColor}15`, border: `1px solid ${accentColor}40` }}>
          <span className={cn(status === "ACTIVE" && "animate-pulse-glow")} style={{ width: 6, height: 6, background: accentColor, borderRadius: 0, boxShadow: `0 0 8px ${accentColor}` }} />
          <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, color: accentColor, letterSpacing: 1 }}>
            {status}
          </span>
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5, marginBottom: 6 }}>
            // CURRENT_GOAL
          </div>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 14, color: theme.colors.text }}>
            {goal}
          </div>
        </div>
        
        <div>
          <div style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 0.5, marginBottom: 8 }}>
            // SYSTEM_RISK_LEVEL
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--font-primary)", fontSize: 12, fontWeight: 600, color: riskLevel === "High" ? theme.colors.danger : theme.colors.running, width: 48 }}>
              {riskLevel.toUpperCase()}
            </span>
            <div style={{ flex: 1, height: 4, background: theme.colors.sidebar, position: "relative" }}>
              <div 
                style={{ 
                  position: "absolute", left: 0, top: 0, bottom: 0, 
                  width: riskLevel === "Low" ? "25%" : riskLevel === "Medium" ? "50%" : "85%",
                  background: riskLevel === "High" ? theme.colors.danger : theme.colors.running,
                  boxShadow: `0 0 8px ${riskLevel === "High" ? theme.colors.danger : theme.colors.running}80`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
