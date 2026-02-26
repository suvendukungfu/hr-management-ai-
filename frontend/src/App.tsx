import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { GodModeDashboard } from './app/GodModeDashboard.js';
import { AgentControlPage } from './app/AgentControlPage.js';
import { PlannerGraphPage } from './app/PlannerGraphPage.js';
import { SimulationPage } from './app/SimulationPage.js';
import { ReflectionPage } from './app/ReflectionPage.js';
import { CandidateProfilePage } from './app/CandidateProfilePage.js';
import { EventTimelinePage } from './app/EventTimelinePage.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<GodModeDashboard />} />
        <Route path="/agent-control" element={<AgentControlPage />} />
        <Route path="/planner-graph" element={<PlannerGraphPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/reflection" element={<ReflectionPage />} />
        <Route path="/candidate-profile" element={<CandidateProfilePage />} />
        <Route path="/event-stream" element={<EventTimelinePage />} />
        {/* Fallback Analytics placeholder to match side menu */}
        <Route path="/analytics" element={<CandidateProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
