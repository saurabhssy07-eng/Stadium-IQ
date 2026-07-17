import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../DashboardStore';
import { MapPin, Clock, AlertTriangle, ShieldAlert, Info, Users, Timer } from 'lucide-react';
import styles from './IncidentFeed.module.css';

export const IncidentFeed: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  const setSelectedIncident = useDashboardStore(state => state.setSelectedIncident);
  // Force a re-render every second to update the "seconds ago" timer
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  if (incidents.length === 0) {
    return (
      <div className={styles.emptyState}>
        No active incidents<br />
        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>System is operating normally</span>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'Critical') return <ShieldAlert size={14} className={styles.iconCritical} />;
    if (severity === 'High') return <AlertTriangle size={14} className={styles.iconHigh} />;
    return <Info size={14} className={styles.iconMedium} />;
  };

  const getButtonText = (status: string) => {
    if (status === 'Reported') return 'Dispatch';
    if (status === 'Assigned' || status === 'Responding') return 'Investigate';
    return 'Archived';
  };

  return (
    <div className={styles.feedContainer} aria-live="polite" role="log" aria-label="Active Incidents Feed">
      {incidents.slice(0, 5).map(inc => {
        // We use status to determine if it's active/solid vs dim/outlined
        const isActionable = inc.status === 'Reported';
        const cardClass = isActionable ? styles.cardActive : styles.cardDim;

        return (
          <div 
            key={inc.id} 
            className={`${styles.incidentCard} ${cardClass} ${styles[inc.severity.toLowerCase()]}`}
            onClick={() => setSelectedIncident(inc.id)}
          >
            
            <div className={styles.opHeader}>
              <div className={styles.severityBadge}>
                {getSeverityIcon(inc.severity)}
                <span className={isActionable ? styles.textGlow : ''}>{inc.severity}</span>
              </div>
              <div className={styles.opZone}>
                <MapPin size={12} />
                {inc.location.zoneId}
              </div>
            </div>
            
            <div className={styles.incidentTitle}>
              {inc.rawText}
            </div>
            
            <div className={styles.opGrid}>
              <div className={styles.opStat}>
                <span className={styles.opLabel}>Detected</span>
                {/* eslint-disable-next-line react-hooks/purity */}
                <span className={styles.opValue}><Clock size={12} /> {Math.floor((Date.now() - inc.timestamp) / 1000)}s ago</span>
              </div>
              
              <div className={styles.opStat}>
                <span className={styles.opLabel}>Assigned</span>
                <span className={styles.opValue}><Users size={12} /> {inc.status === 'Reported' ? 'Pending' : inc.assignee || 'Alpha Team'}</span>
              </div>
              
              <div className={styles.opStat}>
                <span className={styles.opLabel}>ETA</span>
                <span className={styles.opValue}><Timer size={12} /> {inc.status === 'Reported' ? '--' : inc.eta || '2 min'}</span>
              </div>
              
              <div className={styles.opAction}>
                <button 
                  className={`${styles.actionBtn} ${isActionable ? styles.btnPrimary : styles.btnSecondary}`}
                  aria-label={`${getButtonText(inc.status)} ${inc.rawText}`}
                  onClick={(e) => {
                    // Stop propagation so we don't trigger the card twice
                    e.stopPropagation();
                    setSelectedIncident(inc.id);
                  }}
                >
                  {getButtonText(inc.status)}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
