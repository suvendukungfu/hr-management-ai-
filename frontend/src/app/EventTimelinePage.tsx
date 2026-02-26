import React from 'react';
import { AppLayout } from '../../components/Layout';
import { EventTimeline } from '../../components/mission-control/EventTimeline';

export function EventTimelinePage() {
  return (
    <AppLayout title="Live Event Stream" subtitle="Observe real-time autonomous routing events">
      <div className="p-6">
        <EventTimeline />
      </div>
    </AppLayout>
  );
}
