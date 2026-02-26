import React from "react";
import { cn } from "../../lib/utils.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";
import { Card } from "../Layout.js";
import { theme } from "../../theme.js";

interface ReflectionLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: "insight" | "warning" | "error";
}

interface ReflectionDashboardProps {
  className?: string;
  logs?: ReflectionLog[];
}

export function ReflectionDashboard({ className, logs }: ReflectionDashboardProps) {
  const { plannerEvents } = useAntigravityState();

  const mappedLogs: ReflectionLog[] = logs || (plannerEvents.length > 0
    ? plannerEvents.map((ev, i) => ({
        id: `rl-${i}-${ev.time}`,
        timestamp: ev.time,
        source: ev.type === 'reflection' ? 'PLANNER' : ev.type.toUpperCase(),
        message: ev.msg,
        type: ev.msg.toLowerCase().includes('bias') || ev.msg.toLowerCase().includes('fail') ? 'warning' : 'insight'
      })) as ReflectionLog[]
    : [
        { id: "l1", timestamp: "10:42 AM", source: "RECRUITER AGENT", message: "Optimizing search query for React developers.", type: "insight" },
        { id: "l2", timestamp: "10:45 AM", source: "BIAS DETECTION", message: "Detected potential gender terminology bias in Job Req 402.", type: "warning" },
        { id: "l3", timestamp: "10:50 AM", source: "PLANNER", message: "Re-routing candidate evaluation due to missing criteria.", type: "insight" },
      ]);

  return (
    <Card className={cn("flex flex-col gap-6", className)} padding={24}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "var(--font-secondary)", fontSize: 18, fontWeight: 600, margin: 0, color: theme.colors.text }}>
          INTELLIGENCE REFLECTION
        </h3>
        <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 600, color: theme.colors.muted, letterSpacing: 1 }}>
          // SYSTEM_INSIGHTS
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, overflowY: "auto", paddingRight: 4 }} className="custom-scrollbar">
        {mappedLogs.map((log) => {
          const logColor = log.type === "error" ? theme.colors.danger : 
                           log.type === "warning" ? theme.colors.waiting : 
                           theme.colors.ready;
          
          return (
            <div key={log.id} className="animate-fade-in-up transition-colors" style={{ 
              display: "flex", gap: 16, padding: "16px", background: theme.colors.sidebar, border: `1px solid ${theme.colors.panelBorder}`,
              borderLeft: `2px solid ${logColor}`
            }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ 
                      fontFamily: "var(--font-primary)", fontSize: 9, fontWeight: 700, padding: "2px 6px", 
                      background: `${logColor}15`, color: logColor, letterSpacing: 1 
                    }}>
                      [{log.type.toUpperCase()}]
                    </span>
                    <span style={{ fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, color: theme.colors.text, letterSpacing: 0.5 }}>
                      {log.source.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-primary)", fontSize: 9, color: theme.colors.muted }}>
                    {log.timestamp}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-primary)", fontSize: 11, margin: 0, color: theme.colors.text, lineHeight: 1.5 }}>
                  {log.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
