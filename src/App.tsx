import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './features/dashboard/DashboardLayout';
import { FanLayout } from './features/fan/FanLayout';
import { DemoPanel } from './components/DemoPanel/DemoPanel';
import { stadiumTwin } from './simulation/DigitalTwin';
import { Orchestrator } from './orchestrator';
import './App.css';

// Initialize the global brain of the system
const globalOrchestrator = new Orchestrator();

function App() {
  useEffect(() => {
    // Start the Digital Stadium Twin background loop
    stadiumTwin.startSimulation();
    return () => {
      stadiumTwin.stopSimulation();
    };
  }, []);

  return (
    <BrowserRouter>
      <DemoPanel />
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/fan/*" element={<FanLayout />} />
        {/* Default route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
