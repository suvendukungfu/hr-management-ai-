import React from "react";
import { AppLayout, Card } from "../components/Layout.js";
import { theme, statusColor } from "../theme.js";

// No hardcoded nodes

import { useAntigravityState } from "../hooks/useAntigravityState.js";

export default function PlannerGraphView() {
  const { evolvingGraph, memory } = useAntigravityState();
  const nodes = Array.isArray(evolvingGraph) ? evolvingGraph : (evolvingGraph as any).nodes || [];

  return (
    <AppLayout title="Planner Graph View" subtitle="Visual task execution graph with node dependencies">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Labels Bar ===== */}
        <div className="animate-in" style={{ gridColumn: "span 12" }}>
          <Card style={{ display: "flex", gap: 32, padding: "14px 24px" }}>
            <LabelChip label="Planner Strategy" value={memory.strategy || "N/A"} color={theme.colors.text} />
            <LabelChip label="System Risk" value={memory.riskLevel} color={memory.riskLevel === 'LOW' ? theme.colors.running : theme.colors.waiting} />
            <LabelChip label="Confidence" value={(memory.confidenceIndex / 100).toFixed(2)} color={theme.colors.ready} />
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: theme.colors.muted }}>
              <span className="live-dot running" /> Graph Live
            </div>
          </Card>
        </div>

        {/* ===== Graph Visualization ===== */}
        <div className="animate-in animate-in-delay-2" style={{ gridColumn: "span 12" }}>
          <Card style={{ minHeight: "55vh", display: "flex", flexDirection: "column", gap: 48, padding: "40px 60px", alignItems: "center", justifyContent: "center" }}>

            {/* Level 0: Manager */}
            {nodes.filter((n: any) => n.level === 0).map((n: any) => <GraphNode key={n.id} {...n} />)}

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 2, height: 24, background: `linear-gradient(to bottom, ${theme.colors.running}, ${theme.colors.panelBorder})` }} />
              <span style={{ fontSize: "0.7rem", color: theme.colors.idle }}>dispatches</span>
              <div style={{ width: 2, height: 24, background: theme.colors.panelBorder }} />
            </div>

            {/* Level 1: Workers / Guards */}
            <div style={{ display: "flex", gap: 48, width: "100%", justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              {nodes.filter((n: any) => n.level === 1).map((n: any, i: number) => (
                <React.Fragment key={n.id}>
                  {i > 0 && n.isInjected && (
                     <div className="animate-in" style={{ display: "flex", alignItems: "center" }}>
                       <div style={{ width: 40, height: 2, background: theme.colors.panelBorder }} />
                       <span style={{ fontSize: "0.65rem", color: theme.colors.danger, margin: "0 4px", fontWeight: 700 }}>BLOCKS →</span>
                       <div style={{ width: 40, height: 2, background: theme.colors.panelBorder }} />
                     </div>
                  )}
                  {i > 0 && !n.isInjected && (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ width: 40, height: 2, background: theme.colors.panelBorder }} />
                      <span style={{ fontSize: "0.65rem", color: theme.colors.idle, margin: "0 4px" }}>→</span>
                      <div style={{ width: 40, height: 2, background: theme.colors.panelBorder }} />
                    </div>
                  )}
                  <GraphNode {...n} />
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 2, height: 24, background: theme.colors.panelBorder }} />
              <span style={{ fontSize: "0.7rem", color: theme.colors.idle }}>resolves</span>
              <div style={{ width: 2, height: 24, background: `linear-gradient(to bottom, ${theme.colors.panelBorder}, ${theme.colors.ready})` }} />
            </div>

            {/* Level 2: Scheduler */}
            {nodes.filter((n: any) => n.level === 2).map((n: any) => <GraphNode key={n.id} {...n} />)}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function GraphNode({ name, status, isInjected }: { name: string; status: string; level?: number; isInjected?: boolean }) {
  const color = statusColor(status);
  const isActive = status === "ACTIVE" || status === "RUNNING";
  const borderColor = isInjected ? theme.colors.danger : (isActive ? color : theme.colors.panelBorder);

  return (
    <div className={isInjected ? "animate-in" : ""} style={{
      background: theme.colors.bg,
      border: `2px solid ${borderColor}`,
      padding: "18px 28px",
      borderRadius: 12,
      textAlign: "center",
      boxShadow: isInjected ? `0 0 24px ${theme.colors.danger}40` : (isActive ? `0 0 24px ${color}20` : "none"),
      transition: "all 0.3s ease",
      minWidth: 140,
    }}>
      <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: 8, fontSize: "0.95rem" }}>{name}</div>
      <span style={{
        fontSize: "0.7rem", fontWeight: 600,
        color,
        background: `${color}15`,
        padding: "3px 12px", borderRadius: 6,
      }}>{status}</span>
    </div>
  );
}

function LabelChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem" }}>
      <span style={{ color: theme.colors.muted }}>{label}:</span>
      <span style={{ fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
