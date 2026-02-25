import { AppLayout, Card } from "../components/Layout";
import { StatusDot } from "../components/StatusDot";
import { useMissionControl } from "../hooks/useMissionControl";
import { theme } from "../theme";
import { useState } from "react";

export default function GodModeDashboard() {
  const { systemState, events, triggerApi } = useMissionControl();
  const [goal, setGoal] = useState("Hire a new software engineer");

  const plannerRunning = systemState?.planner_running;
  
  const statuses = [
    `Manager Planner: ${plannerRunning ? "ACTIVE" : "STANDBY"}`,
    `Current Goal: ${systemState?.current_goal || "None"}`,
    `Simulation Mode: ENABLED`,
    `Memory Entries: ${Object.keys(systemState?.system_memory || {}).length}`,
  ];
  
  const agents = systemState?.agents || {
    "RecruiterAgent": "IDLE",
    "SchedulerAgent": "IDLE",
    "AnalyticsAgent": "IDLE",
    "BiasDetectionAgent": "IDLE",
  };

  const recentEvents = events.slice(-5).reverse();

  return (
    <AppLayout title="AI Hiring Mission Control">
      
      <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
        <input 
          value={goal}
          onChange={e => setGoal(e.target.value)}
          style={{ 
            flex: 1, 
            background: theme.colors.panel, 
            border: `1px solid ${theme.colors.panelBorder}`,
            color: theme.colors.text,
            padding: "12px 16px",
            borderRadius: theme.layout.cardRadius,
            fontSize: "1rem"
          }}
        />
        <button 
          onClick={() => triggerApi('/planner/start', { goal })}
          disabled={plannerRunning}
          style={{
            background: theme.colors.running,
            color: "#000",
            border: "none",
            padding: "0 24px",
            borderRadius: theme.layout.cardRadius,
            fontWeight: "bold",
            cursor: plannerRunning ? "not-allowed" : "pointer",
            opacity: plannerRunning ? 0.5 : 1
          }}
        >
          Execute Mission
        </button>
        <button 
          onClick={() => triggerApi('/planner/stop')}
          disabled={!plannerRunning}
          style={{
            background: "transparent",
            color: "red",
            border: "1px solid red",
            padding: "0 24px",
            borderRadius: theme.layout.cardRadius,
            fontWeight: "bold",
            cursor: !plannerRunning ? "not-allowed" : "pointer",
            opacity: !plannerRunning ? 0.5 : 1
          }}
        >
          Abort
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
        {statuses.map((s, i) => (
          <div key={i} style={{ gridColumn: "span 3" }}>
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontWeight: 'bold' }}>
              {s}
            </Card>
          </div>
        ))}
        
        <div style={{ gridColumn: "span 8" }}>
          <Card style={{ height: '100%' }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted }}>Worker Agents Map</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Object.entries(agents).map(([name, st]) => (
                <div key={name} style={{ background: theme.colors.bg, padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><StatusDot state={st} /> {name}</span>
                  <span style={{ fontSize: '0.8rem', color: theme.colors.muted }}>{st}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        <div style={{ gridColumn: "span 4" }}>
          <Card style={{ height: '100%', overflow: 'hidden' }}>
            <h3 style={{ margin: "0 0 16px 0", color: theme.colors.muted }}>Recent Events</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentEvents.length === 0 && <div style={{ color: theme.colors.muted }}>No events yet...</div>}
              {recentEvents.map((ev, i) => (
                <div key={i} style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: theme.colors.ready }}>[{ev.topic}]</span> 
                  <span style={{ marginLeft: 8, color: theme.colors.muted }}>
                  {typeof ev.data === 'string' ? ev.data : (ev.data.message || ev.data.status || 'Event triggered')}
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
