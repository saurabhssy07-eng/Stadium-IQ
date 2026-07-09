import React from 'react';
import { useDashboardStore } from '../DashboardStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './RiskPanel.module.css';

export const RiskPanel: React.FC = () => {
  const zones = useDashboardStore(state => state.zones);

  // Generate deterministic but dynamic looking trend data based on zoneId
  const getTrend = (zoneId: string, score: number) => {
    // Just a mock function to create trend arrows for demo purposes
    const hash = zoneId.length + score;
    const isUp = hash % 2 === 0;
    const amount = (hash % 20) + 1; // 1 to 20%
    
    // If score is very low, trend is likely flat or slightly down
    if (score < 10) return { dir: 'flat', val: 0 };
    
    return { dir: isUp ? 'up' : 'down', val: amount };
  };

  return (
    <div className={styles.container}>
      {Object.entries(zones).map(([zoneId, data]) => {
        const percentage = Math.round(data.riskScore);
        const statusClass = styles[data.status] || styles.normal;
        const trend = getTrend(zoneId, percentage);
        
        return (
          <div key={zoneId} className={styles.riskRow}>
            <div className={styles.zoneInfo}>
              <span className={styles.zoneName}>{zoneId}</span>
              <span className={`${styles.statusLabel} ${statusClass}`}>{data.status}</span>
            </div>
            
            <div className={styles.trendInfo}>
              <span className={`${styles.percentage} ${statusClass}`}>{percentage}%</span>
              
              <div className={`${styles.trendPill} ${trend.dir === 'up' ? styles.trendUp : trend.dir === 'down' ? styles.trendDown : styles.trendFlat}`}>
                {trend.dir === 'up' && <TrendingUp size={14} />}
                {trend.dir === 'down' && <TrendingDown size={14} />}
                {trend.dir === 'flat' && <Minus size={14} />}
                
                <span className={styles.trendVal}>
                  {trend.dir === 'up' ? '+' : trend.dir === 'down' ? '-' : ''}{trend.val}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
