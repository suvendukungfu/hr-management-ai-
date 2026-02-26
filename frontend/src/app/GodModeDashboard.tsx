import React, { useState } from "react";
import { AppLayout, MetricCard } from "../../components/Layout.js";
import { PlannerStatusCard } from "../../components/mission-control/PlannerStatusCard.js";
import { AgentControlPanel } from "../../components/mission-control/AgentControlPanel.js";
import { PlannerGraph } from "../../components/mission-control/PlannerGraph.js";
import { SimulationPanel } from "../../components/mission-control/SimulationPanel.js";
import { ReflectionDashboard } from "../../components/mission-control/ReflectionDashboard.js";
import { CandidateProfile } from "../../components/mission-control/CandidateProfile.js";
import { EventTimeline } from "../../components/mission-control/EventTimeline.js";
import { useAntigravityState } from "../../hooks/useAntigravityState.js";

export function GodModeDashboard() {
  const { systemState, memory, triggerApi } = useAntigravityState();

  const pgNodes = [
    { id: "n1", label: "Initialize", status: "completed" as const },
    { id: "n2", label: "Source Candidates", status: "completed" as const },
    { id: "n3", label: "Evaluate Fit", status: "active" as const },
    { id: "n4", label: "Schedule Interview", status: "pending" as const },
  ];

  const reflectionLogs = [
    { id: "l1", timestamp: "10:42 AM", source: "Recruiter Agent", message: "Optimizing search query for React developers.", type: "insight" as const },
    { id: "l2", timestamp: "10:45 AM", source: "Bias Detection", message: "Detected potential gender terminology bias in Job Req 402.", type: "warning" as const },
    { id: "l3", timestamp: "10:50 AM", source: "Planner", message: "Re-routing candidate evaluation due to missing criteria.", type: "insight" as const },
  ];

  const topCandidate = {
    name: "Alex Rivera",
    role: "Senior Full-Stack Engineer",
    matchScore: 96,
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    status: "Interviewing"
  };

  return (
    <AppLayout title="God-Mode Mission Control" subtitle="AI Recruitment Pipeline">
      <div className="grid grid-cols-12 gap-4 p-6" style={{ gap: 'var(--spacing-grid, 16px)', padding: 'var(--spacing-outer, 24px)' }}>
        
        {/* Metric Cards Bound to useAntigravityState */}
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          <MetricCard label="Planner Strategy" value={memory.strategy || "N/A"} icon="🎯" />
          <MetricCard label="System Risk" value={memory.riskLevel || "Low"} icon="🛡️" />
          <MetricCard label="Simulation Mode" value="ENABLED" icon="🧪" />
          <MetricCard label="Confidence Index" value={`${memory.confidenceIndex || 0}%`} icon="📊" />
        </div>

        {/* Global Controls */}
        <div className="col-span-12 flex gap-4 mb-2">
          <button className="btn btn-primary" onClick={() => triggerApi('/planner/start')}>
            ▶ Execute Mission
          </button>
          <button className="btn btn-danger" onClick={() => triggerApi('/planner/stop')}>
            ■ Abort
          </button>
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlannerStatusCard 
              status={systemState?.status || "ACTIVE"} 
              goal={memory.strategy || "Hire a Senior Engineer"} 
              riskLevel={memory.riskLevel || "Low"} 
            />
            <CandidateProfile candidate={topCandidate} />
          </div>

          <AgentControlPanel />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PlannerGraph nodes={pgNodes} className="h-full" />
            <SimulationPanel className="h-full" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          <ReflectionDashboard logs={reflectionLogs} className="flex-1" />
          <EventTimeline className="flex-1" />
        </div>

      </div>
    </AppLayout>
  );
}
