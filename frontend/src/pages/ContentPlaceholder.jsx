import { AppLayout, Card } from "../components/Layout";
import { theme } from "../theme";

export default function CandidatesAndAnalytics({ title, desc }) {
  // Shared mock page for Candidates / Analytics 
  // since these are mostly data views dependent on historical data.
  return (
    <AppLayout title={title}>
      <Card style={{ minHeight: '60vh' }}>
        <h3 style={{ marginTop: 0, color: theme.colors.ready }}>{desc}</h3>
        <p style={{ color: theme.colors.muted }}>
          This module is designed to display aggregated data from the AnalyticsAgent and RecruiterAgent.
          Run a few missions in the main dashboard, and this area will populate with discovered candidates or performance metrics.
        </p>
        
        <div style={{ 
          marginTop: 40, 
          padding: 40, 
          border: `2px dashed ${theme.colors.panelBorder}`, 
          borderRadius: 12,
          textAlign: 'center',
          color: theme.colors.idle 
        }}>
          Waiting for backend data synchronization...
        </div>
      </Card>
    </AppLayout>
  );
}
