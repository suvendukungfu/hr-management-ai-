import React from 'react';
import { AppLayout } from '../components/Layout.js';
import { PlannerGraph } from '../components/mission-control/PlannerGraph.js';

export function PlannerGraphPage() {
  const nodes = [
    { id: "n1", label: "Initialize", status: "completed" as const },
    { id: "n2", label: "Source Candidates", status: "completed" as const },
    { id: "n3", label: "Evaluate Fit", status: "active" as const },
    { id: "n4", label: "Schedule Interview", status: "pending" as const },
  ];

  return (
    <AppLayout title="Planner Graph" subtitle="View execution trace and node status">
      <div className="p-6">
        <PlannerGraph nodes={nodes} />
      </div>
    </AppLayout>
  );
}
