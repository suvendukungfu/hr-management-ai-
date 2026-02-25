import { AppLayout, Card } from "../components/Layout";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";

export default function SimulationPanel() {
  const { systemState, simResults, triggerApi } = useMissionControl();

  return (
    <AppLayout title="Pre-Execution Simulation">
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={() => triggerApi('/simulation/run', { goal: systemState?.current_goal || "Test Simulation" })}
          style={{
            background: theme.colors.running,
            color: "#000",
            border: "none",
            padding: "10px 20px",
            borderRadius: theme.layout.cardRadius,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Run Predictive Simulation
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted }}>Simulation Results</h3>
          {simResults ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(simResults.results || {}).map(([node, data]) => (
                <div key={node} style={{ background: theme.colors.bg, padding: 16, borderRadius: 8, border: `1px solid ${theme.colors.panelBorder}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 'bold' }}>{node}</span>
                    <span style={{ color: data.predicted_success > 0.85 ? theme.colors.running : 'red' }}>
                      {Math.round(data.predicted_success * 100)}% Success Probability
                    </span>
                  </div>
                  <div style={{ height: 6, background: theme.colors.panelBorder, borderRadius: 3 }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${data.predicted_success * 100}%`, 
                      background: data.predicted_success > 0.85 ? theme.colors.running : 'red',
                      borderRadius: 3
                    }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: theme.colors.muted, fontStyle: 'italic' }}>
              No simulation data. Click the button above to generate a forecast.
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
