import { AppLayout, Card } from "../components/Layout";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";

export default function LiveEventStream() {
  const { events } = useMissionControl();

  return (
    <AppLayout title="Live Event Stream">
      <Card style={{ minHeight: '70vh' }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.length === 0 && <div style={{ color: theme.colors.muted }}>Listening for system events...</div>}
          
          {events.map((ev, i) => (
            <div key={i} style={{ 
              background: theme.colors.bg, 
              padding: 16, 
              borderRadius: 8,
              borderLeft: `4px solid ${theme.colors.ready}`
            }}>
              <div style={{ fontSize: '0.8rem', color: theme.colors.muted, textTransform: 'uppercase', marginBottom: 8, fontWeight: 'bold' }}>
                {ev.topic}
              </div>
              <div style={{ fontSize: '0.95rem', color: theme.colors.text }}>
                {typeof ev.data === 'string' ? ev.data : (
                  <pre style={{ margin: 0, color: theme.colors.ready, overflowX: 'auto' }}>
                    {JSON.stringify(ev.data, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )).reverse()}
        </div>
      </Card>
    </AppLayout>
  );
}
