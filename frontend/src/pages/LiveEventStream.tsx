import React from "react";
import { AppLayout, Card } from "../components/Layout.js";
import { theme } from "../theme.js";

const mockEvents = [
  { time: "12:01", msg: "Planner Generated Task Graph", type: "system" as const },
  { time: "12:02", msg: "Recruiter Agent Completed Analysis — 47 resumes scanned", type: "agent" as const },
  { time: "12:03", msg: "Reflection Engine Triggered — Confidence updated to 0.93", type: "reflection" as const },
  { time: "12:04", msg: "Scheduler Agent Waiting Approval for 3 interviews", type: "waiting" as const },
  { time: "12:05", msg: "Bias Detection Agent — All clear, 0 flags raised", type: "agent" as const },
  { time: "12:06", msg: "Simulation Re-run — Updated success prediction: 91%", type: "system" as const },
  { time: "12:07", msg: "Analytics Pipeline updated candidate ranking matrix", type: "agent" as const },
  { time: "12:08", msg: "Manager Planner issued final hiring recommendation", type: "system" as const },
];

const typeStyles: Record<string, { color: string; icon: string }> = {
  system: { color: theme.colors.ready, icon: "⚙️" },
  agent: { color: theme.colors.running, icon: "🤖" },
  reflection: { color: theme.colors.accent, icon: "🧠" },
  waiting: { color: theme.colors.waiting, icon: "⏳" },
};

export default function LiveEventStream() {
  return (
    <AppLayout title="Live Event Stream" subtitle="Real-time system event history and audit trail">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Event Stream ===== */}
        <div className="animate-in" style={{ gridColumn: "span 12" }}>
          <Card style={{ minHeight: "72vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: theme.colors.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                System Event History
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: theme.colors.muted }}>
                <span className="live-dot running" /> Streaming
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mockEvents.map((ev, i) => {
                const style = typeStyles[ev.type];
                return (
                  <div
                    key={i}
                    className={`animate-in animate-in-delay-${Math.min(i + 1, 4)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      background: theme.colors.bg,
                      padding: "16px 20px",
                      borderRadius: 10,
                      borderLeft: `4px solid ${style?.color || theme.colors.text}`,
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>{style?.icon || "•"}</span>
                    <span style={{
                      color: style?.color || theme.colors.text,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      minWidth: 55,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      [{ev.time}]
                    </span>
                    <span style={{ color: theme.colors.text, fontSize: "0.92rem", flex: 1 }}>
                      {ev.msg}
                    </span>
                    <span style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: style?.color || theme.colors.text,
                      background: `${style?.color || theme.colors.text}15`,
                      padding: "3px 10px",
                      borderRadius: 6,
                      textTransform: "uppercase",
                    }}>
                      {ev.type}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
