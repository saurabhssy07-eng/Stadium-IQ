import React from 'react';
import { useDashboardStore } from '../DashboardStore';
import { CheckCircle2 } from 'lucide-react';
import styles from './ExplainabilityPanel.module.css';

export const ExplainabilityPanel: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  const incident = incidents[0]; 

  if (!incident) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.pulseDot} />
        Awaiting AI Telemetry
      </div>
    );
  }

  // Generate dynamic mock data based on incident ID so it remains stable for a given incident
  const hash = incident.id.length; 
  const confidence = 85 + (hash % 14); // 85-98%
  const affectedFans = 120 + (hash * 13) % 2000;

  return (
    <div className={styles.container}>
      
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Confidence</div>
          <div className={styles.kpiValuePurple}>{confidence}%</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Affected</div>
          <div className={styles.kpiValueBlue}>{affectedFans.toLocaleString()}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Severity</div>
          <div className={incident.severity === 'Critical' ? styles.kpiValueRed : styles.kpiValueOrange}>
            {incident.severity.toUpperCase()}
          </div>
        </div>
      </div>

      <div className={styles.reasonSection}>
        <div className={styles.sectionLabel}>AI Reasoning</div>
        <div className={styles.reasonList}>
          <div className={styles.reasonItem}>
            <CheckCircle2 size={16} className={styles.checkIcon} />
            <span>Sensor anomaly detected</span>
          </div>
          <div className={styles.reasonItem}>
            <CheckCircle2 size={16} className={styles.checkIcon} />
            <span>Abnormal crowd density</span>
          </div>
          <div className={styles.reasonItem}>
            <CheckCircle2 size={16} className={styles.checkIcon} />
            <span>Historic chokepoint match</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};
