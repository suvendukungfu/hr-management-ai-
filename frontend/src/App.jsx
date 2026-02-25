import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GodModeDashboard from './pages/GodModeDashboard';
import AgentControlPanel from './pages/AgentControlPanel';
import PlannerGraphView from './pages/PlannerGraphView';
import SimulationPanel from './pages/SimulationPanel';
import ReflectionEngine from './pages/ReflectionEngine';
import LiveEventStream from './pages/LiveEventStream';
import ContentPlaceholder from './pages/ContentPlaceholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GodModeDashboard />} />
        <Route path="/agents" element={<AgentControlPanel />} />
        <Route path="/planner" element={<PlannerGraphView />} />
        <Route path="/simulation" element={<SimulationPanel />} />
        <Route path="/reflection" element={<ReflectionEngine />} />
        <Route path="/events" element={<LiveEventStream />} />
        <Route path="/candidates" element={<ContentPlaceholder title="Candidates" desc="Sourced Profiles" />} />
        <Route path="/analytics" element={<ContentPlaceholder title="Analytics" desc="Platform Metrics" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
