import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import GodModeDashboard from './pages/GodModeDashboard';
import AgentControlPanel from './pages/AgentControlPanel';
import PlannerGraphView from './pages/PlannerGraphView';
import SimulationPanel from './pages/SimulationPanel';
import ReflectionEngine from './pages/ReflectionEngine';
import CandidateProfile from './pages/CandidateProfile';
import LiveEventStream from './pages/LiveEventStream';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<GodModeDashboard />} />
        <Route path="/agent-control" element={<AgentControlPanel />} />
        <Route path="/planner-graph" element={<PlannerGraphView />} />
        <Route path="/simulation" element={<SimulationPanel />} />
        <Route path="/reflection" element={<ReflectionEngine />} />
        <Route path="/candidate-profile" element={<CandidateProfile />} />
        <Route path="/event-stream" element={<LiveEventStream />} />
        {/* Fallback Analytics placeholder to match side menu */}
        <Route path="/analytics" element={<CandidateProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
