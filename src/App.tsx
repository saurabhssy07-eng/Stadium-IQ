import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { stadiumTwin } from './simulation/DigitalTwin';
import { Orchestrator } from './orchestrator';
import { Loader2 } from 'lucide-react';
import './App.css';

// Lazy loading route components
const DashboardLayout = lazy(() => import('./features/dashboard/DashboardLayout').then(module => ({ default: module.DashboardLayout })));
const FanLayout = lazy(() => import('./features/fan/FanLayout').then(module => ({ default: module.FanLayout })));
const DemoPanel = lazy(() => import('./components/DemoPanel/DemoPanel').then(module => ({ default: module.DemoPanel })));

// Initialize the global brain of the system
new Orchestrator();

// Loading Fallback
const FullScreenLoader = () => (
  <div style={{ display: 'flex', width: '100vw', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)' }}>
    <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
  </div>
);

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
      <Suspense fallback={null}>
        <DemoPanel />
      </Suspense>
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/fan/*" element={<FanLayout />} />
          {/* Default route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
