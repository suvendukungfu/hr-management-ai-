import { AppLayout, Card } from "../components/Layout";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";

export default function ReflectionEngine() {
  const { systemState } = useMissionControl();
  
  const memory = systemState?.system_memory || {};

  return (
    <AppLayout title="Reflection Engine Memory">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
        {Object.keys(memory).length === 0 ? (
          <div style={{ gridColumn: "span 12", color: theme.colors.muted }}>
            System memory is empty. Agents must complete cycles for reflection to occur.
          </div>
        ) : (
          Object.entries(memory).map(([agent, mem], i) => (
            <div key={i} style={{ gridColumn: "span 6" }}>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: theme.colors.text }}>{agent}</h3>
                  <span style={{ 
                    background: mem.last_score > 0.8 ? 'rgba(111, 243, 163, 0.1)' : 'rgba(255, 194, 110, 0.1)', 
                    color: mem.last_score > 0.8 ? theme.colors.running : theme.colors.waiting,
                    padding: '4px 8px', borderRadius: 4, fontSize: '0.85rem'
                  }}>
                    Performance Score: {mem.last_score}
                  </span>
                </div>
                
                <div style={{ background: theme.colors.bg, padding: 12, borderRadius: 6, borderLeft: `3px solid ${theme.colors.ready}`}}>
                  <div style={{ fontSize: '0.8rem', color: theme.colors.muted, marginBottom: 4 }}>LLM FEEDBACK / REFLECTION</div>
                  <div style={{ color: theme.colors.text }}>"{mem.feedback}"</div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
