import React, { useEffect, useState } from 'react';
import { ShieldAlert, Video, Droplets, CheckCircle, Plus } from 'lucide-react';
import styles from './BottomPanels.module.css';
import { useDashboardStore } from '../DashboardStore';
export const AnalyticsWidget: React.FC = () => {
  return (
    <div className={styles.kpiContainer}>
      <div className={styles.kpiTile}>
        <span className={styles.kpiTileLabel}>Attendance</span>
        <span className={styles.kpiTileValue}>82,431</span>
      </div>
      <div className={styles.kpiTile}>
        <span className={styles.kpiTileLabel}>Avg Response</span>
        <span className={styles.kpiTileValue}>38s</span>
      </div>
      <div className={styles.kpiTile}>
        <span className={styles.kpiTileLabel}>AI Accuracy</span>
        <span className={styles.kpiTileValue}>97%</span>
      </div>
      <div className={styles.kpiTile}>
        <span className={styles.kpiTileLabel}>Incidents</span>
        <span className={styles.kpiTileValue}>12</span>
      </div>
      <div className={styles.kpiTile}>
        <span className={styles.kpiTileLabel}>Resolved</span>
        <span className={styles.kpiTileValue}>94%</span>
      </div>
    </div>
  );
};

export const CrowdFlowWidget: React.FC = () => {
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.statRow}>
        <span className={styles.label}>Ingress</span>
        <div className={styles.sparklineContainer}>
          <span className={styles.value} style={{ color: 'var(--color-success)' }}>+240/min</span>
          <svg className={styles.sparkline} viewBox="0 0 100 20" preserveAspectRatio="none">
            <polyline points="0,15 20,15 30,5 40,15 50,8 60,15 80,15 100,15" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className={styles.statRow}>
        <span className={styles.label}>Egress</span>
        <div className={styles.sparklineContainer}>
          <span className={styles.value}>-12/min</span>
          <svg className={styles.sparkline} viewBox="0 0 100 20" preserveAspectRatio="none">
            <polyline points="0,15 20,15 30,10 40,15 50,12 60,15 80,15 100,15" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export const VolunteersWidget: React.FC = () => {
  return (
    <div className={styles.widgetContainer}>
      <div className={styles.volunteerRow}>
        <div className={styles.volunteerInfo}>
          <span className={styles.label}><span className={`${styles.statusIndicator} ${styles.online}`}></span> Alpha Team</span>
          <span className={styles.subtext}>Gate B</span>
        </div>
        <div className={styles.volunteerStatus}>
          <span className={styles.etaText}>ETA 1:48 | Distance 94m</span>
          <span className={styles.value}>Responding</span>
        </div>
      </div>
      
      <div className={styles.volunteerRow}>
        <div className={styles.volunteerInfo}>
          <span className={styles.label}><span className={`${styles.statusIndicator} ${styles.standby}`}></span> Medical Staff</span>
          <span className={styles.subtext}>Sec 112</span>
        </div>
        <div className={styles.volunteerStatus}>
          <span className={styles.etaText}></span>
          <span className={styles.value}>Patrolling</span>
        </div>
      </div>
      
      <div className={styles.volunteerRow}>
        <div className={styles.volunteerInfo}>
          <span className={styles.label}><span className={`${styles.statusIndicator} ${styles.active}`}></span> Maintenance</span>
          <span className={styles.subtext}>Food Court</span>
        </div>
        <div className={styles.volunteerStatus}>
          <span className={styles.etaText}>ETA 4:12 | Distance 310m</span>
          <span className={styles.value}>Busy</span>
        </div>
      </div>
    </div>
  );
};

export const RecentEventsWidget: React.FC<{ isZoomed?: boolean }> = ({ isZoomed = false }) => {
  const timelineLogs = useDashboardStore(state => state.executionTimeline);
  const incidents = useDashboardStore(state => state.incidents);

  // Derive logs from real data
  const logs = React.useMemo(() => {
    const events: {id: string, type: string, timeStr: string, timestamp: number, msg: string, icon: any}[] = [];
    
    // Add real orchestrator timeline logs
    timelineLogs.forEach(log => {
       if (log.status === 'Completed' || log.status === 'Failed') {
          let icon = ShieldAlert;
          let type = 'System';
          if (log.agentName === 'Ingestion' || log.agentName === 'Orchestrator') { icon = CheckCircle; type = 'AI'; }
          else if (log.action.includes('Dispatch')) { icon = Plus; type = 'Medical'; }
          else { icon = ShieldAlert; type = 'Analysis'; }

          const date = new Date(log.timestamp);
          const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

          events.push({
            id: `log_${log.timestamp}_${log.agentName}`,
            type,
            timeStr,
            timestamp: log.timestamp,
            msg: `[${log.agentName}] ${log.action}`,
            icon
          });
       }
    });

    // Add real incident reports
    incidents.forEach(inc => {
       const date = new Date(inc.timestamp);
       const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
       
       events.push({
          id: `inc_${inc.id}_new`,
          type: 'Emergency',
          timeStr,
          timestamp: inc.timestamp,
          msg: `New Incident: ${inc.type} at ${inc.location.zoneId}`,
          icon: ShieldAlert
       });

       if (inc.status === 'Resolved') {
          events.push({
            id: `inc_${inc.id}_res`,
            type: 'Resolved',
            timeStr,
            timestamp: inc.timestamp + 1000,
            msg: `Incident Resolved: ${inc.type}`,
            icon: CheckCircle
         });
       }
    });

    // Sort newest first
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events;
  }, [timelineLogs, incidents]);

  return (
    <div className={styles.widgetContainer}>
      <div 
        className={styles.logList} 
        style={{ 
          padding: '0.5rem 0', 
          position: 'relative',
          flexWrap: isZoomed ? 'wrap' : 'nowrap',
          gap: isZoomed ? '1rem 1.5rem' : '1.5rem',
          alignItems: isZoomed ? 'flex-start' : 'center',
          overflowX: isZoomed ? 'visible' : 'auto'
        }}
      >
        {/* Connecting horizontal line in the background (only when not zoomed) */}
        {!isZoomed && <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }} />}
        
        {logs.length === 0 && (
          <div style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            No recent events in the system.
          </div>
        )}

        {logs.slice(0, isZoomed ? 36 : 6).map((log, i) => {
          let colorClass = styles.eventNormal;
          if (log.type === 'Resolved') colorClass = styles.eventSuccess;
          else if (log.type === 'AI') colorClass = styles.eventAI;
          else if (log.type === 'Emergency') colorClass = styles.eventDanger;
          else if (log.type === 'Medical') colorClass = styles.eventInfo;

          return (
            <div key={log.id} className={styles.logEntry} style={{ position: 'relative', zIndex: 1 }}>
              <div className={`${styles.logDot} ${colorClass}`}></div>
              <div className={styles.logContent}>
                <div className={styles.logHeader}>
                  <span className={styles.logType}>{log.type}</span>
                  <span className={styles.logTime}>{log.timeStr}</span>
                </div>
                <div className={styles.logMsg}>{log.msg}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
