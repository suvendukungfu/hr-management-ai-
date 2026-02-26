import React from 'react';
import { AppLayout } from '../../components/Layout';
import { ReflectionDashboard } from '../../components/mission-control/ReflectionDashboard';

export function ReflectionPage() {
  const logs = [
    { id: "l1", timestamp: "10:42 AM", source: "Recruiter Agent", message: "Optimizing search query for React developers.", type: "insight" as const },
    { id: "l2", timestamp: "10:45 AM", source: "Bias Detection", message: "Detected potential gender terminology bias in Job Req 402.", type: "warning" as const },
  ];

  return (
    <AppLayout title="Reflection Engine" subtitle="Real-time system insights">
      <div className="p-6 h-full flex flex-col">
        <ReflectionDashboard logs={logs} className="flex-1" />
      </div>
    </AppLayout>
  );
}
