import React, { useEffect, useState, useMemo } from 'react';
import { Activity, Map, LayoutDashboard, Settings, Brain, Clock, ShieldAlert, Info, Play, Maximize2, Minimize2, ChevronRight, Smartphone } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { StadiumMap } from './components/StadiumMap';
import { AgentTimeline } from './components/AgentTimeline';
import { IncidentFeed } from './components/IncidentFeed';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { RiskPanel } from './components/RiskPanel';
import { RecommendationBanner } from './components/RecommendationBanner';
import { AnalyticsWidget, CrowdFlowWidget, VolunteersWidget, RecentEventsWidget } from './components/BottomPanels';
import { stadiumEventBus } from '../../simulation/EventBus';
import { useDashboardStore } from './DashboardStore';
import { TabbedPanel } from './components/TabbedPanel';
import { IncidentDrawer } from './components/IncidentDrawer';
import styles from './DashboardLayout.module.css';

// Animated Number Component
const AnimatedNumber = React.memo(({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value - 400); // Start slightly lower for counting effect
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const duration = 1500; // 1.5s
    const startValue = value - 400; // Arbitrary offset for demo

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const easeOutQuad = 1 - Math.pow(1 - progress / duration, 3);
        const current = startValue + (value - startValue) * easeOutQuad;
        setDisplayValue(Math.floor(current));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
});

// Reusable Panel Component wrapped in framer-motion
interface PanelProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  onZoom: (id: string) => void;
  isZoomed: boolean;
}

const Panel: React.FC<PanelProps> = React.memo(({ id, title, icon, className = '', children, onZoom, isZoomed }) => {
  if (isZoomed) {
    return <div className={className} style={{ opacity: 0 }} />;
  }

  return (
    <motion.div 
      layoutId={`panel-${id}`}
      className={`glass-panel ${styles.panel} ${className}`}
    >
      <div className={styles.panelHeader} onClick={() => onZoom(id)}>
        <div className={styles.headerTitle}>{icon} {title}</div>
        <Maximize2 size={16} />
      </div>
      <div className={styles.panelContent}>
        {children}
      </div>
    </motion.div>
  );
});

export const DashboardLayout: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  const toastMsg = useDashboardStore(state => state.toastMsg);
  const showToast = useDashboardStore(state => state.showToast);
  
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [zoomedPanelId, setZoomedPanelId] = useState<string | null>(null);
  
  // Ticking match clock state (starts at 42:15 = 2535 seconds)
  const [matchSeconds, setMatchSeconds] = useState(2535);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setMatchSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Demo Scenario Trigger
  const runDemoScenario = (scenario: string, type: string, priority: "Low" | "Medium" | "High" | "Critical", zoneId: string) => {
    setDemoMenuOpen(false);
    showToast(`Running ${scenario} Scenario...`);
    stadiumEventBus.publish({
      id: `demo_${scenario.replace(' ', '_').toLowerCase()}_${Date.now()}`,
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: type,
      priority: priority,
      location: { x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10, zoneId },
      payload: { message: `Demo: ${scenario} detected at ${zoneId}` }
    });
  };

  // Setup Tabs
  const tabs = useMemo(() => [
    { id: 'analytics', label: 'Analytics', content: <AnalyticsWidget /> },
    { id: 'crowd', label: 'Crowd Flow', content: <CrowdFlowWidget /> },
    { id: 'volunteers', label: 'Volunteers', content: <VolunteersWidget /> },
    { id: 'risk', label: 'Predictive Risk', content: <RiskPanel /> }
  ], []);

  // Helper to get panel content for Zoom Overlay
  const getPanelContent = (id: string) => {
    switch(id) {
      case 'map': return <StadiumMap />;
      case 'pipeline': return <AgentTimeline />;
      case 'incidents': return <IncidentFeed />;
      case 'explain': return <ExplainabilityPanel />;
      case 'tabs': return <TabbedPanel tabs={tabs} />;
      case 'events': return <RecentEventsWidget isZoomed={true} />;
      default: return null;
    }
  };
  
  const getPanelTitle = (id: string) => {
    switch(id) {
      case 'map': return 'Live Digital Stadium Twin';
      case 'pipeline': return 'AI Decision Pipeline';
      case 'incidents': return 'Active Incidents';
      case 'explain': return 'AI Explainability';
      case 'tabs': return 'Operational Data';
      case 'events': return 'Live Event Log';
      default: return 'Focus Mode';
    }
  };

  const activeIncidents = useMemo(() => incidents.filter(i => i.status !== 'Resolved'), [incidents]);
  const criticalCount = useMemo(() => activeIncidents.filter(i => i.severity === 'Critical').length, [activeIncidents]);
  const highCount = useMemo(() => activeIncidents.filter(i => i.severity === 'High').length, [activeIncidents]);

  const IncidentTitle = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ShieldAlert size={18} />
        Active Incidents
      </span>
      {activeIncidents.length > 0 && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', gap: '8px' }}>
          <span>{activeIncidents.length} Active</span>
          {highCount > 0 && <span style={{ color: 'var(--color-warn)' }}>| {highCount} High</span>}
          {criticalCount > 0 && <span style={{ color: 'var(--color-crit)' }}>| {criticalCount} Critical</span>}
        </span>
      )}
    </div>
  );

  return (
    <LayoutGroup>
      <div className={styles.container}>
        
        {/* Main Wrapper including Sidebar */}
        <div className={styles.mainWrapper}>
          
          {/* Sidebar */}
          <div className={styles.sidebarWrapper}>
            <aside className={`glass-panel ${styles.sidebar}`}>
              <button className={`${styles.navButton} ${styles.active}`} aria-label="Dashboard" onClick={() => showToast('Dashboard is currently active.')}>
                <LayoutDashboard size={24} />
                <span>Dashboard</span>
              </button>
              <button className={styles.navButton} aria-label="Events" onClick={() => setZoomedPanelId('events')}>
                <Clock size={24} />
                <span>Events</span>
              </button>
              <button className={styles.navButton} aria-label="Analytics" onClick={() => setZoomedPanelId('tabs')}>
                <Activity size={24} />
                <span>Analytics</span>
              </button>
              <button className={styles.navButton} aria-label="Fan App" onClick={() => window.open('/fan', '_blank')}>
                <Smartphone size={24} />
                <span>Fan App</span>
              </button>
              <div style={{ flex: 1 }}></div>
              <div style={{ position: 'relative' }}>
                <button 
                  className={styles.navButton} 
                  style={{ color: demoMenuOpen ? 'var(--color-primary)' : 'inherit' }}
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                >
                  <Play size={24} fill="currentColor" />
                  <span>Demo</span>
                </button>
                <AnimatePresence>
                  {demoMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={styles.demoMenu}
                    >
                      <div className={styles.demoMenuHeader}>🎬 Demo Scenarios</div>
                      <button onClick={() => runDemoScenario('Medical Emergency', 'MEDICAL', 'Critical', 'Sec 112')}>Medical Emergency</button>
                      <button onClick={() => runDemoScenario('Crowd Surge', 'CROWD', 'High', 'Gate C')}>Crowd Surge</button>
                      <button onClick={() => runDemoScenario('Fire Alert', 'HAZARD', 'Critical', 'Food Court')}>Fire Alert</button>
                      <button onClick={() => runDemoScenario('Lost Child', 'SECURITY', 'High', 'Gate A')}>Lost Child</button>
                      <button onClick={() => runDemoScenario('Food Court Spill', 'HAZARD', 'Medium', 'Food Court')}>Food Court Spill</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button className={styles.navButton} aria-label="Settings" onClick={() => showToast('Settings panel coming soon!')}>
                <Settings size={24} />
                <span>Settings</span>
              </button>
            </aside>
          </div>

          {/* Main Grid Area */}
          <main className={styles.mainGrid}>
            
            {/* 1. Top Status (KPIs) - Mission Control Bar */}
            <header className={`glass-panel ${styles.topbar} ${activeIncidents.length > 0 ? styles.topbarActiveIncident : ''}`}>
              {activeIncidents.length > 0 ? (
                <>
                  <div className={styles.missionControlAlert}>
                    <ShieldAlert size={20} className={styles.missionAlertIcon} />
                    <span className={styles.missionAlertText}>⚠ ACTIVE INCIDENT</span>
                  </div>
                  <div className={styles.healthMetric}>
                    <span className={styles.healthValue} style={{ color: 'var(--color-text)' }}>{activeIncidents[0].location.zoneId}</span>
                    <span className={styles.healthLabel}>Location</span>
                  </div>
                  <div className={styles.healthMetric}>
                    <span className={styles.healthValue} style={{ color: 'var(--color-warn)' }}>{activeIncidents[0].eta || '3.2 min'}</span>
                    <span className={styles.healthLabel}>Response ETA</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.healthMetric}>
                    <span className={`${styles.healthValue} ${styles.valueSuccess}`}>🟢 Operational</span>
                    <span className={styles.healthLabel}>System Status</span>
                  </div>
                  <div className={styles.healthMetric}>
                    <span className={styles.healthValue}>{formatTime(matchSeconds)}</span>
                    <span className={styles.healthLabel}>Match Time</span>
                  </div>
                </>
              )}
              
              <div style={{ flex: 1 }} />
              
              <div className={styles.healthMetric}>
                <span className={styles.healthValue}><AnimatedNumber value={82431} /></span>
                <span className={styles.healthLabel}>Attendance</span>
              </div>
              <div className={styles.healthMetric}>
                <span className={styles.healthValue}>38s</span>
                <span className={styles.healthLabel}>Avg Response</span>
              </div>
              <div className={styles.healthMetric}>
                <span className={styles.healthValue}>97%</span>
                <span className={styles.healthLabel}>AI Accuracy</span>
              </div>
            </header>

            {/* Recommendation Banner - Sticky */}
            <div style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <RecommendationBanner />
            </div>

            {/* Row 1: Map & Pipeline */}
            <div className={styles.gridRow}>
              <Panel 
                id="map"
                title="" 
                icon={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Map size={18} />
                      Live Digital Stadium Twin
                    </span>
                    <span style={{ color: 'var(--color-success)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', background: 'var(--color-success)', borderRadius: '50%', display: 'inline-block' }}></span>
                      LIVE
                    </span>
                  </div>
                }
                className={styles.mapArea}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'map'}
              >
                <StadiumMap />
              </Panel>
              
              <Panel 
                id="pipeline"
                title="AI Decision Pipeline" 
                icon={<Activity size={18} />} 
                className={styles.pipelineArea}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'pipeline'}
              >
                <AgentTimeline />
              </Panel>
            </div>

            {/* Row 2: Incidents & Explainability */}
            <div className={styles.gridRow}>
              <Panel 
                id="incidents"
                title="" 
                icon={IncidentTitle}
                className={styles.incidentsArea}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'incidents'}
              >
                <IncidentFeed />
              </Panel>

              
              <Panel 
                id="explain"
                title="AI Explainability" 
                icon={<Brain size={18} />} 
                className={styles.explainArea}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'explain'}
              >
                <ExplainabilityPanel />
              </Panel>
            </div>

            {/* Row 3: Tabbed Panel */}
            <div className={styles.gridRow}>
              <Panel 
                id="tabs"
                title="Operational Data" 
                icon={<Activity size={18} />} 
                className={styles.tabbedArea}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'tabs'}
              >
                <TabbedPanel tabs={tabs} />
              </Panel>
            </div>

            {/* Footer: Live Event Timeline */}
            <div className={styles.eventsFooter}>
              <Panel 
                id="events"
                title="Live Event Log" 
                icon={<Clock size={18} />} 
                className={styles.footerPanel}
                onZoom={setZoomedPanelId}
                isZoomed={zoomedPanelId === 'events'}
              >
                <RecentEventsWidget />
              </Panel>
            </div>

          </main>
        </div>

        {/* Deep Inspection (Focus Mode) Overlay */}
        <AnimatePresence>
          {zoomedPanelId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className={styles.deepInspectionOverlay}
            >
              <div className={styles.breadcrumb}>
                <span>Operations Center</span>
                <ChevronRight size={16} color="var(--color-text-secondary)" />
                {getPanelTitle(zoomedPanelId)}
                
                <button className={styles.closeBtn} aria-label="Minimize panel" onClick={() => setZoomedPanelId(null)}>
                  <Minimize2 size={16} /> Minimize
                </button>
              </div>

              <motion.div 
                layoutId={`panel-${zoomedPanelId}`}
                className={styles.zoomedPanelContent}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                {getPanelContent(zoomedPanelId)}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Incident Investigation Drawer */}
        <IncidentDrawer />

        {/* Premium Custom Toast Notification */}
        {toastMsg && (
          <div className={styles.toast}>
            <Info size={18} className={styles.toastIcon} />
            {toastMsg.msg}
          </div>
        )}
      </div>
    </LayoutGroup>
  );
};
