import React from "react";
import { AppLayout, Card, MetricCard } from "../components/Layout";
import { StatusDot } from "../components/StatusDot";
import { useAntigravityState } from "../hooks/useAntigravityState";
import { theme, statusColor } from "../theme";

export default function GodModeDashboard() {
  const { systemState, events, triggerApi, memory } = useAntigravityState();

  const statuses = [
    { label: "Planner Strategy", value: memory.strategy, icon: "🎯" },
    { label: "System Risk", value: memory.riskLevel, icon: "🛡️" },
    { label: "Simulation Mode", value: "ENABLED", icon: "🧪" },
    { label: "Confidence Index", value: `${memory.confidenceIndex}%`, icon: "📊" },
  ];

  const agentStates = systemState?.agents || {
    "Recruiter Agent": "RUNNING",
    "Scheduler Agent": "WAITING",
    "Analytics Agent": "IDLE",
    "Bias Detection Agent": "READY",
  };

  const timelineEvents = events.length > 0 ? [...events].reverse().slice(0, 6) : [
    { topic: "planner:init", data: "Planner Initialized" },
    { topic: "agent:running", data: "Recruiter Agent Started" },
    { topic: "simulation:start", data: "Simulation Running" },
    { topic: "reflection:trigger", data: "Reflection Engine Activated" },
  ];

  const handleExecute = () => {
    triggerApi("/planner/start", { goal: "Hire a new software engineer" });
  };

  return (
    <AppLayout title="AI Hiring Mission Control" subtitle="Autonomous multi-agent recruitment pipeline">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Status Cards ===== */}
        {statuses.map((s, i) => (
          <div key={i} className={`animate-in animate-in-delay-${i + 1}`} style={{ gridColumn: "span 3" }}>
            <MetricCard label={s.label} value={s.value} color={statusColor(s.value)} icon={s.icon} />
          </div>
        ))}

        {/* ===== Execute / Abort ===== */}
        <div className="animate-in animate-in-delay-2" style={{ gridColumn: "span 12", display: "flex", gap: 12, margin: "4px 0" }}>
          <button className="btn btn-primary" onClick={handleExecute}>
            ▶ Execute Mission
          </button>
          <button className="btn btn-danger">
            ■ Abort
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: theme.colors.muted }}>
            <span className="live-dot running" /> Pipeline Active
          </div>
        </div>

        {/* ===== Agent Activity Grid ===== */}
        <div className="animate-in animate-in-delay-3" style={{ gridColumn: "span 8" }}>
          <Card>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "0.9rem", fontWeight: 600, color: theme.colors.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Worker Agents Map
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.entries(agentStates).map(([name, st]) => (
                <div key={name} style={{
                  background: theme.colors.bg,
                  padding: "14px 16px",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: `1px solid ${theme.colors.panelBorder}`,
                  transition: "border-color 0.2s",
                }}>
                  <span style={{ fontWeight: 500, color: theme.colors.text, display: "flex", alignItems: "center" }}>
                    <StatusDot state={st as string} /> {name}
                  </span>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: statusColor(st as string),
                    background: `${statusColor(st as string)}15`,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}>
                    {st as string}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== Live Timeline ===== */}
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 4" }}>
          <Card style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "0.9rem", fontWeight: 600, color: theme.colors.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Recent Events
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto" }}>
              {timelineEvents.map((ev, i) => (
                <div key={i} style={{
                  fontSize: "0.84rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "8px 10px",
                  background: theme.colors.bg,
                  borderRadius: 8,
                  borderLeft: `3px solid ${theme.colors.ready}`,
                }}>
                  <span style={{ color: theme.colors.ready, fontWeight: 600, whiteSpace: "nowrap" }}>
                    [12:0{i + 1}]
                  </span>
                  <span style={{ color: theme.colors.text }}>
                    {typeof ev.data === "string" ? ev.data : (ev.data as any).message || ev.topic}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
