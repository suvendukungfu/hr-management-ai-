import React, { useState } from 'react';
import { AppLayout } from '../../components/Layout';
import { SimulationPanel } from '../../components/mission-control/SimulationPanel';

export function SimulationPage() {

  return (
    <AppLayout title="Simulation Engine" subtitle="Run predictive hiring scenarios">
      <div className="p-6">
        <SimulationPanel />
      </div>
    </AppLayout>
  );
}
