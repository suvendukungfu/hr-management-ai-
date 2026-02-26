import React from "react";
import { AppLayout, Card } from "../components/Layout.js";
import { StatusDot } from "../components/StatusDot.js";
import { theme, statusColor } from "../theme.js";
import { useMissionControl } from "../hooks/useMissionControl.js";

export default function AgentControlPanel() {
  const { triggerApi, systemState } = useMissionControl();

  const handleAction = (type: string) => {
    if (type === "start") triggerApi("/planner/start", { goal: "Mock manual trigger" });
    if (type === "stop") triggerApi("/planner/stop");
    if (type === "sim") triggerApi("/simulation/run", { goal: "Sim run" });
    if (type === "recruit") triggerApi("/agent/RecruiterAgent/trigger", { goal: "Trigger recruiter" });
  };

  const agents = systemState?.agents || {
    RecruiterAgent: "RUNNING",
    SchedulerAgent: "WAITING",
    AnalyticsAgent: "IDLE",
    BiasDetectionAgent: "READY",
  };

  const mockLogs = [
    { time: "12:01", msg: "Planner Started — Goal: Hire Senior ML Engineer", type: "info" },
    { time: "12:02", msg: "RecruiterAgent executed — 47 candidates scanned", type: "success" },
    { time: "12:03", msg: "Simulation Triggered — Confidence: 0.91", type: "info" },
    { time: "12:04", msg: "BiasDetectionAgent flagged 0 issues", type: "success" },
    { time: "12:05", msg: "SchedulerAgent queued 3 interviews", type: "warn" },
  ];

  return (
    <AppLayout title="Agent Control Panel" subtitle="Start, stop, and monitor autonomous agents">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Controls ===== */}
        <div className="animate-in" style={{ gridColumn: "span 12", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={() => handleAction("start")}>▶ Start Planner</button>
          <button className="btn btn-danger" onClick={() => handleAction("stop")}>■ Stop Planner</button>
          <button className="btn btn-info" onClick={() => handleAction("sim")}>🧪 Run Simulation</button>
          <button className="btn btn-warn" onClick={() => handleAction("recruit")}>👤 Trigger Recruiter</button>
        </div>

        {/* ===== Agent Cards ===== */}
        {Object.entries(agents).map(([name, st], i) => (
          <div key={i} className={`animate-in animate-in-delay-${i + 1}`} style={{ gridColumn: "span 3" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{name}</div>
                <span style={{
                  fontSize: "0.7rem", fontWeight: 600,
                  color: statusColor(st as string),
                  background: `${statusColor(st as string)}15`,
                  padding: "2px 10px", borderRadius: 6,
                }}>{st as string}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.84rem", color: theme.colors.muted }}>
                <StatusDot state={st as string} /> Agent Process
              </div>
              {/* Mini metrics */}
              <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: theme.colors.idle, textTransform: "uppercase" }}>Tasks</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: theme.colors.text }}>{Math.floor(Math.random() * 50 + 10)}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: theme.colors.idle, textTransform: "uppercase" }}>Latency</div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: theme.colors.text }}>{Math.floor(Math.random() * 80 + 20)}ms</div>
                </div>
              </div>
            </Card>
          </div>
        ))}

        {/* ===== Logs ===== */}
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 12" }}>
          <Card>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "0.9rem", fontWeight: 600, color: theme.colors.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Live Agent Logs
            </h3>
            <div style={{ background: theme.colors.bg, padding: 16, borderRadius: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.84rem" }}>
              {mockLogs.map((log, i) => {
                const colors: Record<string, string> = { info: theme.colors.ready, success: theme.colors.running, warn: theme.colors.waiting };
                return (
                  <div key={i} style={{ marginBottom: 10, display: "flex", gap: 12 }}>
                    <span style={{ color: theme.colors.idle, whiteSpace: "nowrap" }}>[{log.time}]</span>
                    <span style={{ color: colors[log.type] || theme.colors.text }}>{log.msg}</span>
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
