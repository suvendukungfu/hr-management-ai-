import { AppLayout, Card } from "../components/Layout";
import { StatusDot } from "../components/StatusDot";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";

export default function AgentControlPanel() {
  const { systemState, triggerApi } = useMissionControl();
  
  const agents = systemState?.agents || {
    "RecruiterAgent": "IDLE",
    "SchedulerAgent": "IDLE",
    "AnalyticsAgent": "IDLE",
    "BiasDetectionAgent": "IDLE",
  };

  return (
    <AppLayout title="Agent Control Panel">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
        {Object.entries(agents).map(([name, st]) => (
          <div key={name} style={{ gridColumn: "span 6" }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{name}</h3>
                <span style={{ fontSize: '0.8rem', color: theme.colors.muted, background: theme.colors.bg, padding: '4px 8px', borderRadius: 4 }}>
                  <StatusDot state={st} /> {st}
                </span>
              </div>
              <p style={{ color: theme.colors.muted, fontSize: '0.9rem', marginBottom: 20 }}>
                Specialized worker agent ready to execute sub-graphs.
              </p>
              <button 
                onClick={() => triggerApi(`/agent/${name}/trigger`, { goal: "Manual trigger" })}
                style={{
                  background: theme.colors.panelBorder,
                  color: theme.colors.text,
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Ping Agent
              </button>
            </Card>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
