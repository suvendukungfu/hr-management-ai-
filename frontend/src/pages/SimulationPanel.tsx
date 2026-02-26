import React from "react";
import { AppLayout, Card, MetricCard } from "../components/Layout.js";
import { theme, statusColor } from "../theme.js";
import { useAntigravityState } from "../hooks/useAntigravityState.js";

export default function SimulationPanel() {
  const { simResults, triggerApi, triggerRiskEvent, memory } = useAntigravityState();

  const handleSimRun = () => {
    triggerApi("/simulation/run", { goal: "Predict Node Execution Outcomes" });
  };

  const handleInjectRisk = () => {
    triggerRiskEvent();
  };

  const mockForecasts = [
    { name: "RecruiterAgent", prob: 0.94 },
    { name: "SchedulerAgent", prob: 0.88 },
    { name: "AnalyticsAgent", prob: 0.76 },
    { name: "BiasDetectionAgent", prob: 0.97 },
  ];

  const riskActive = memory.riskLevel === 'HIGH' || memory.riskLevel === 'CRITICAL';

  return (
    <AppLayout title="Simulation Panel" subtitle="Pre-execution prediction and risk analysis">
      <div className="grid-12" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: theme.layout.gridGap }}>

        {/* ===== Top Metrics ===== */}
        <div className="animate-in animate-in-delay-1" style={{ gridColumn: "span 4" }}>
          <MetricCard label="Predicted Hiring Success" value={`${memory.confidenceIndex}%`} color={riskActive ? theme.colors.waiting : theme.colors.running} icon="🎯" />
        </div>
        <div className="animate-in animate-in-delay-2" style={{ gridColumn: "span 4" }}>
          <MetricCard label="Bias Risk" value={memory.riskLevel} color={riskActive ? theme.colors.danger : theme.colors.running} icon="🛡️" />
        </div>
        <div className="animate-in animate-in-delay-3" style={{ gridColumn: "span 4" }}>
          <MetricCard label="Planner Recommendation" value={riskActive ? "Inject Guardrails" : "Schedule Interview"} color={riskActive ? theme.colors.danger : theme.colors.ready} icon="📋" />
        </div>

        {/* ===== Action & Risk Meter ===== */}
        <div className="animate-in animate-in-delay-3" style={{ gridColumn: "span 12", display: "flex", gap: 16, alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSimRun}>🧪 Run Dynamic Simulation</button>
          <button className="btn btn-danger" onClick={handleInjectRisk}>⚠️ Inject Edge-Case Risk</button>

          <Card style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}>
            <span style={{ color: theme.colors.muted, fontSize: "0.85rem", whiteSpace: "nowrap" }}>Live Risk Meter</span>
            <div className="progress-bar" style={{ flex: 1 }}>
              <div className="progress-bar-fill" style={{ width: riskActive ? "85%" : "15%", background: riskActive ? theme.colors.danger : theme.colors.running }} />
            </div>
            <span style={{ color: riskActive ? theme.colors.danger : theme.colors.running, fontWeight: 600, fontSize: "0.85rem" }}>
              {riskActive ? "85%" : "15%"}
            </span>
          </Card>
        </div>

        {/* ===== Prediction Summary ===== */}
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 6" }}>
          <Card style={{ height: "100%" }}>
            <h3 style={{ margin: "0 0 20px 0", color: theme.colors.muted, fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Node-Level Forecasts
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {(simResults?.results ? Object.entries(simResults.results as Record<string, any>) : mockForecasts.map(f => [f.name, { predicted_success: f.prob }])).map(([node, data]) => {
                const prob = (data as any).predicted_success || (data as any).prob || 0;
                const clr = prob > 0.85 ? theme.colors.running : prob > 0.7 ? theme.colors.waiting : theme.colors.danger;
                return (
                  <div key={node as string}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{node as string}</span>
                      <span style={{ color: clr, fontWeight: 600 }}>{Math.round(prob * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{ width: `${prob * 100}%`, background: clr }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ===== Planner Reasoning ===== */}
        <div className="animate-in animate-in-delay-4" style={{ gridColumn: "span 6" }}>
          <Card style={{ height: "100%" }}>
            <h3 style={{ margin: "0 0 20px 0", color: theme.colors.muted, fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Planner Reasoning Log
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { id: "SYS_SIM_01", text: "Simulated execution path optimized for speed vs accuracy." },
                { id: "SYS_SIM_02", text: "SchedulerAgent predicted success 98% based on candidate timezones." },
                { id: "SYS_SIM_03", text: "BiasDetectionAgent flagged no concerning terms in simulated JD." },
              ].map((r) => (
                <div key={r.id} style={{ background: theme.colors.bg, padding: "12px 16px", borderRadius: 8, borderLeft: `3px solid ${theme.colors.ready}` }}>
                  <span style={{ color: theme.colors.ready, fontWeight: 600, fontSize: "0.8rem" }}>[{r.id}]</span>
                  <span style={{ color: theme.colors.text, fontSize: "0.88rem", marginLeft: 8 }}>{r.text}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </AppLayout>
  );
}
