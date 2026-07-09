import React from 'react';
import { useDashboardStore } from '../DashboardStore';
import { Bot, ArrowRight, CheckCircle } from 'lucide-react';
import styles from './RecommendationBanner.module.css';

export const RecommendationBanner: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  const executeRecommendation = useDashboardStore(state => state.executeRecommendation);
  
  // Show banner for top active incident (Assigned or less)
  const topIncident = incidents.find(inc => 
    inc.status !== 'Resolved' && inc.status !== 'Responding' && (inc.severity === 'Critical' || inc.severity === 'High')
  );

  if (!topIncident) {
    return (
      <div className={`${styles.banner} ${styles.standby}`}>
        <div className={styles.iconWrapper} style={{ color: 'var(--color-text-secondary)' }}>
          <Bot size={28} />
        </div>
        <div className={styles.content}>
          <div className={styles.title} style={{ color: 'var(--color-text-secondary)' }}>
            SYSTEM STANDBY
          </div>
          <div className={styles.message} style={{ color: 'var(--color-text-secondary)' }}>
            Monitoring all zones. No critical anomalies detected.
          </div>
        </div>
      </div>
    );
  }

  const isExecuted = topIncident.status === 'Assigned';

  return (
    <div className={`${styles.banner} ${isExecuted ? styles.executed : ''}`}>
      <div className={styles.iconWrapper}>
        {isExecuted ? <CheckCircle size={28} /> : <Bot size={28} />}
      </div>
      
      <div className={styles.content}>
        <div className={styles.title} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span>{isExecuted ? 'COMMAND EXECUTED' : '⚠ AI COMMAND'}</span>
          {isExecuted && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              {new Date(topIncident.timestamp + 6000).toLocaleTimeString([], { hour12: false })}
            </span>
          )}
        </div>
        <div className={styles.message}>
          {topIncident.location.zoneId} congestion predicted.
        </div>
        {!isExecuted && (
          <div className={styles.recommendationAction}>
            <span className={styles.actionLabel}>Recommended Action</span>
            <span className={styles.actionText}>Open Exit C. Dispatch Team Alpha.</span>
          </div>
        )}
      </div>

      <div className={styles.metrics}>
        <div className={styles.metricLabel}>Expected Delay Reduction</div>
        <div className={styles.metricValue}>
          ↓ 3.2 min
        </div>
      </div>

      {!isExecuted && (
        <button className={styles.actionBtn} onClick={() => executeRecommendation(topIncident.id)}>
          Execute Recommendation <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};
