import React from "react";
import { AppLayout, Card, MetricCard } from "../components/Layout.js";
import { theme } from "../theme.js";
import { useAntigravityState } from "../hooks/useAntigravityState.js";

export default function ReflectionEngine() {
  const { memory, addReflection } = useAntigravityState();

  const handleGoodReflection = () => {
    addReflection(96, "High candidate match rate. Execution optimal.", "Recruiter");
  };

  const handleBadReflection = () => {
    addReflection(70, "Analytics latency spike detected. Reducing confidence.", "Analytics");
  };

  return (
    <AppLayout title="Reflection Engine" subtitle="Post-execution analysis and memory updates">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Top Metrics ===== */}
        <div className="animate-in animate-in-delay-1" style={{ gridColumn: "span 3" }}>
          <MetricCard label="Engine Status" value="ACTIVE" color={theme.colors.running} icon="🧠" />
        </div>
        <div className="animate-in animate-in-delay-2" style={{ gridColumn: "span 3" }}>
          <MetricCard label="Decision Confidence" value={(memory.confidenceIndex / 100).toFixed(2)} color={theme.colors.ready} icon="🎯" />
        </div>
        <div className="animate-in animate-in-delay-3" style={{ gridColumn: "span 3" }}>
          <MetricCard label="Reflections Logged" value={memory.reflectionLogs.length.toString()} color={theme.colors.text} icon="📚" />
        </div>
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 3" }}>
          <button className="btn btn-outline" style={{ width: '100%', marginBottom: 8, borderColor: theme.colors.running, color: theme.colors.running }} onClick={handleGoodReflection}>+ Good Reflection</button>
          <button className="btn btn-outline" style={{ width: '100%', borderColor: theme.colors.danger, color: theme.colors.danger }} onClick={handleBadReflection}>- Bad Reflection</button>
        </div>

        {/* ===== Confidence Chart Area ===== */}
        <div className="animate-in animate-in-delay-3" style={{ gridColumn: "span 8" }}>
          <Card style={{ height: 400 }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted, fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Confidence Trend
            </h3>
            {/* SVG mini-chart */}
            <div style={{ background: theme.colors.bg, borderRadius: 10, height: "calc(100% - 40px)", display: "flex", alignItems: "flex-end", padding: "20px 24px", gap: 4 }}>
              {memory.confidenceHistory.map((v: number, i: number) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${v}%`,
                  background: `linear-gradient(to top, ${theme.colors.running}40, ${theme.colors.running})`,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.8s ease",
                  position: "relative",
                  minWidth: 10
                }}>
                  <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: "0.6rem", color: theme.colors.muted, whiteSpace: "nowrap" }}>
                    {v}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== Reasoning Log ===== */}
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 4" }}>
          <Card style={{ height: 400 }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted, fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Reasoning Log
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", maxHeight: 320 }}>
              {memory.reflectionLogs.length > 0 ? memory.reflectionLogs.map((r: any, i: number) => (
                <div key={i} className="animate-in" style={{
                  background: theme.colors.bg,
                  padding: 14,
                  borderRadius: 10,
                  borderLeft: `3px solid ${r.score >= 95 ? theme.colors.running : r.score >= 85 ? theme.colors.ready : theme.colors.danger}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{r.agent}</span>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      color: r.score >= 95 ? theme.colors.running : theme.colors.ready,
                      background: `${r.score >= 95 ? theme.colors.running : theme.colors.ready}15`,
                      padding: "2px 8px", borderRadius: 4,
                    }}>{r.score}%</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: theme.colors.muted, lineHeight: 1.4 }}>{r.note}</div>
                </div>
              )) : (
                <div style={{ color: theme.colors.idle, fontStyle: "italic", fontSize: "0.85rem", padding: 16 }}>No reflection logs available. Inject simulations to generate confidence data.</div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
