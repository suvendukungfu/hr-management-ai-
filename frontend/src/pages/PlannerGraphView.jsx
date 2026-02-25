import { AppLayout, Card } from "../components/Layout";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";

export default function PlannerGraphView() {
  const { systemState } = useMissionControl();
  
  const goal = systemState?.current_goal || "No active goal";
  const running = systemState?.planner_running;

  // Since we don't have the explicit graph returned in the state root right now, 
  // we'll mock a visualization based on the running agents.
  const activeAgents = Object.entries(systemState?.agents || {})
    .filter(([, st]) => st !== 'IDLE')
    .map(([name]) => name);

  return (
    <AppLayout title="Planner Graph">
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px 0", color: theme.colors.text }}>Current Mission Goal</h3>
        <p style={{ color: theme.colors.ready, fontSize: '1.1rem', margin: 0 }}>{goal}</p>
        <div style={{ marginTop: 12, fontSize: '0.9rem', color: theme.colors.muted }}>
          Execution Engine Status: <span style={{ color: running ? theme.colors.running : theme.colors.idle }}>
            {running ? "ACTIVE" : "STANDBY"}
          </span>
        </div>
      </Card>

      <Card style={{ minHeight: '50vh' }}>
        <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted }}>Execution Graph Visualization</h3>
        
        {activeAgents.length > 0 ? (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 24px', background: theme.colors.panelBorder, borderRadius: 8, border: `2px solid ${theme.colors.running}` }}>
              Start
            </div>
            
            {activeAgents.map((agent) => (
              <div key={agent} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <span style={{ color: theme.colors.muted }}>→</span>
                <div style={{ padding: '12px 24px', background: theme.colors.bg, borderRadius: 8, border: `1px solid ${theme.colors.ready}` }}>
                  {agent}
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ color: theme.colors.muted }}>→</span>
              <div style={{ padding: '12px 24px', background: theme.colors.panelBorder, borderRadius: 8, border: `2px solid ${theme.colors.idle}` }}>
                End
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: theme.colors.muted, fontStyle: 'italic' }}>
            No execution graph active. Start a mission to see the graph pipeline.
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
