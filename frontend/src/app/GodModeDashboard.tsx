import React from "react";
import { AppLayout, MetricCard } from "../components/Layout.js";
import { PlannerStatusCard } from "../components/mission-control/PlannerStatusCard.js";
import { AgentControlPanel } from "../components/mission-control/AgentControlPanel.js";
import { PlannerGraph } from "../components/mission-control/PlannerGraph.js";
import { SimulationPanel } from "../components/mission-control/SimulationPanel.js";
import { ReflectionDashboard } from "../components/mission-control/ReflectionDashboard.js";
import { CandidateProfile } from "../components/mission-control/CandidateProfile.js";
import { EventTimeline } from "../components/mission-control/EventTimeline.js";
import { useAntigravityState } from "../hooks/useAntigravityState.js";
import { theme } from "../theme.js";

export function GodModeDashboard() {
  const { systemState, memory, triggerApi } = useAntigravityState();

  const pgNodes = [
    { id: "n1", label: "Initialize", status: "completed" as const },
    { id: "n2", label: "Source Candidates", status: "completed" as const },
    { id: "n3", label: "Evaluate Fit", status: "active" as const },
    { id: "n4", label: "Schedule Interview", status: "pending" as const },
  ];

  const topCandidate = {
    name: "Alex Rivera",
    role: "Senior Full-Stack Engineer",
    matchScore: 96,
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    status: "Interviewing"
  };

  const dashboardActions = (
    <>
      <button 
        onClick={() => triggerApi('/planner/stop')}
        style={{
          background: "transparent", border: `1px solid ${theme.colors.danger}`, color: theme.colors.danger,
          fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 600, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8
        }}>
        <span>■</span> ABORT
      </button>
      <button 
        onClick={() => triggerApi('/planner/start')}
        style={{
          background: theme.colors.running, border: "none", color: theme.colors.bg,
          fontFamily: "var(--font-primary)", fontSize: 10, fontWeight: 700, padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8
        }}>
        <span>▶</span> EXECUTE MISSION
      </button>
    </>
  );

  return (
    <AppLayout title="God-Mode Mission Control" subtitle="AI Recruitment Pipeline" actions={dashboardActions}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* Metric Cards Bound to useAntigravityState */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          <MetricCard 
            label="Planner Strategy" 
            value={memory.strategy || "EXECUTE"} 
            icon="⚡" 
            trend="ACTIVE" 
            color={theme.colors.running} 
          />
          <MetricCard 
            label="System Risk" 
            value={memory.riskLevel || "LOW"} 
            icon="🛡️" 
            trend="-1.2%" 
            color={theme.colors.running} 
          />
          <MetricCard 
            label="Simulation Mode" 
            value="ENABLED" 
            icon="🧪" 
            trend="READY" 
            color={theme.colors.running} 
            statusLabel="READY"
          />
          <MetricCard 
            label="Confidence Index" 
            value={`${memory.confidenceIndex || 98}%`} 
            icon="📊" 
            trend="+4.1%" 
            color={theme.colors.running} 
          />
        </div>

        {/* Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }}>
          
          {/* Main Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <PlannerStatusCard
                status={systemState?.status || "ACTIVE"}
                goal={memory.strategy || "Hire a Senior Engineer"}
                riskLevel={memory.riskLevel || "Low"}
              />
              <CandidateProfile candidate={topCandidate} />
            </div>

            <AgentControlPanel />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <SimulationPanel className="h-full" />
              <PlannerGraph nodes={pgNodes} className="h-full" />
            </div>
          </div>

          {/* Sidebar Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <EventTimeline className="flex-1" />
            <ReflectionDashboard className="flex-1" />
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
