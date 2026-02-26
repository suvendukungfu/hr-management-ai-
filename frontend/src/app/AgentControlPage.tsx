import React from 'react';
import { AppLayout } from '../components/Layout';
import { AgentControlPanel } from '../components/mission-control/AgentControlPanel';

export function AgentControlPage() {
  return (
    <AppLayout title="Agent Control Panel" subtitle="Manage individual AI workers">
      <div className="p-6">
        <AgentControlPanel />
      </div>
    </AppLayout>
  );
}
