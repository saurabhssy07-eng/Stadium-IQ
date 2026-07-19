import React from 'react';
import { useDashboardStore } from '../DashboardStore';
import styles from './StadiumMap.module.css';

export const StadiumMap: React.FC = React.memo(() => {
  const zones = useDashboardStore(state => state.zones);
  const incidents = useDashboardStore(state => state.incidents);

  // Helper for heatmap gradients
  const getZoneGradient = (zoneId: string) => {
    const status = zones[zoneId]?.status || 'normal';
    switch (status) {
      case 'critical': return 'url(#grad-critical)';
      case 'heavy': return 'url(#grad-heavy)';
      case 'moderate': return 'url(#grad-moderate)';
      default: return 'none'; // normal has no visible gradient
    }
  };
  
  const getIncidentColor = (status: string) => {
    if (status === 'Assigned' || status === 'Responding') return 'var(--color-warning)';
    if (status === 'Resolved') return 'var(--color-success)';
    return 'var(--color-danger)';
  };

  return (
    <div className={styles.mapContainer}>
      {/* 1. Map Scaling: We use a tighter viewBox to make it dominate the panel */}
      <svg width="100%" height="100%" viewBox="10 10 180 120" preserveAspectRatio="xMidYMid meet" className={styles.blueprint}>
        <defs>
          <radialGradient id="grad-critical" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.3)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>
          <radialGradient id="grad-heavy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.8)" />
            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>
          <radialGradient id="grad-moderate" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g className={styles.stadiumVector}>
          {/* Outer Grounds / Parking */}
          <rect x="5" y="5" width="190" height="130" rx="20" fill="#0f172a" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          
          {/* Main Concourse */}
          <rect x="20" y="15" width="160" height="110" rx="40" fill="#1e293b" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          
          {/* Sections (A, B, C, D) */}
          <path d="M 50 30 Q 100 15 150 30 L 130 50 Q 100 40 70 50 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <path d="M 50 110 Q 100 125 150 110 L 130 90 Q 100 100 70 90 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <path d="M 30 50 Q 15 70 30 90 L 50 75 Q 40 70 50 65 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <path d="M 170 50 Q 185 70 170 90 L 150 75 Q 160 70 150 65 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

          {/* The Pitch */}
          <rect x="65" y="50" width="70" height="40" rx="10" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />
          <line x1="100" y1="50" x2="100" y2="90" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />
          <circle cx="100" cy="70" r="8" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1" />

          {/* Exits & POIs */}
          <rect x="90" y="10" width="20" height="5" fill="rgba(255,255,255,0.1)" /> {/* North Gate */}
          <rect x="90" y="125" width="20" height="5" fill="rgba(255,255,255,0.1)" /> {/* South Gate */}
          <rect x="15" y="60" width="5" height="20" fill="rgba(255,255,255,0.1)" /> {/* West Gate */}
          <rect x="180" y="60" width="5" height="20" fill="rgba(255,255,255,0.1)" /> {/* East Gate / Food Court */}
        </g>

        {/* Labels */}
        <g className={styles.labels}>
          <text x="100" y="25" textAnchor="middle">SEC A (NORTH)</text>
          <text x="100" y="120" textAnchor="middle">SEC C (SOUTH)</text>
          <text x="35" y="72" textAnchor="middle" transform="rotate(-90, 35, 72)">SEC B (WEST)</text>
          <text x="165" y="72" textAnchor="middle" transform="rotate(90, 165, 72)">FOOD COURT</text>
        </g>

        {/* --- HEATMAP LAYER --- */}
        <g className={styles.heatmapLayer}>
          <circle cx="100" cy="20" r="35" fill={getZoneGradient('Gate A')} className={styles.heatPulse} />
          <circle cx="100" cy="120" r="35" fill={getZoneGradient('Gate C')} className={styles.heatPulse} />
          <circle cx="20" cy="70" r="30" fill={getZoneGradient('Gate B')} className={styles.heatPulse} />
          <circle cx="180" cy="70" r="30" fill={getZoneGradient('Food Court')} className={styles.heatPulse} />
        </g>

        {/* --- CROWD STREAMS --- */}
        <g className={styles.crowdStreams}>
          {/* North Stream */}
          <path d="M 100 10 L 100 25" stroke="var(--color-info)" strokeWidth="1" fill="none" className={styles.streamIngress} />
          {/* South Stream */}
          <path d="M 100 130 L 100 115" stroke="var(--color-info)" strokeWidth="1" fill="none" className={styles.streamIngress} />
          {/* West Stream */}
          <path d="M 15 70 L 30 70" stroke="var(--color-info)" strokeWidth="1" fill="none" className={styles.streamIngress} />
          {/* East Stream */}
          <path d="M 185 70 L 170 70" stroke="var(--color-info)" strokeWidth="1" fill="none" className={styles.streamIngress} />
          
          {/* Internal Flow */}
          <path d="M 100 30 C 130 30, 160 50, 160 70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" className={styles.streamFlow} />
          <path d="M 100 110 C 70 110, 40 90, 40 70" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" className={styles.streamFlow} />
        </g>

        {/* --- INCIDENT MARKERS --- */}
        {incidents.filter(inc => inc.status !== 'Resolved').map(inc => {
          const color = getIncidentColor(inc.status);
          const cx = inc.location.x * 2;
          const cy = inc.location.y * 1.4;
          return (
            <g key={inc.id} className={styles.incidentGroup}>
              {/* Ripple Effect */}
              <circle cx={cx} cy={cy} r="8" fill="none" stroke={color} className={styles.incidentRipple} style={{ transformOrigin: `${cx}px ${cy}px` }} />
              <circle cx={cx} cy={cy} r="15" fill="none" stroke={color} className={styles.incidentRipple2} style={{ transformOrigin: `${cx}px ${cy}px` }} />
              
              {/* Google Maps Pin */}
              <path 
                d={`M ${cx} ${cy} C ${cx-4} ${cy-8}, ${cx-6} ${cy-12}, ${cx} ${cy-16} C ${cx+6} ${cy-12}, ${cx+4} ${cy-8}, ${cx} ${cy}`} 
                fill={color} 
                filter="url(#glow)"
              />
              <circle cx={cx} cy={cy-11} r="2" fill="#fff" />
              
              {/* ETA / Status text */}
              {(inc.eta || inc.status === 'Assigned') && (
                <text x={cx} y={cy-22} textAnchor="middle" className={styles.incidentEta} fill={color}>
                  {inc.eta ? `ETA ${inc.eta}` : inc.status}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      {/* 2. Floating Zone Stats (HTML Overlays) */}
      <div className={styles.floatingStatsContainer}>
        {Object.entries(zones).map(([zoneId, data]) => {
          if (data.status !== 'critical' && data.status !== 'heavy') return null;
          
          let top, left;
          switch (zoneId) {
            case 'Gate A': top = '15%'; left = '50%'; break;
            case 'Gate C': top = '85%'; left = '50%'; break;
            case 'Gate B': top = '50%'; left = '15%'; break;
            case 'Food Court': top = '50%'; left = '85%'; break;
            default: return null;
          }

          return (
            <div key={zoneId} className={`${styles.floatingStat} ${styles[data.status]}`} style={{ top, left, transform: 'translate(-50%, -50%)' }}>
              <div className={styles.statHeader}>
                <span className={styles.statZone}>{zoneId}</span>
                <span className={styles.statStatus}>{data.status}</span>
              </div>
              <div className={styles.statBody}>
                <span className={styles.statScore}>{Math.round(data.riskScore)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend Overlay */}
      <div className={styles.legend}>
        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.normal}`}></div> Normal</div>
        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.moderate}`}></div> Moderate</div>
        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.heavy}`}></div> Heavy</div>
        <div className={styles.legendItem}><div className={`${styles.dot} ${styles.critical}`}></div> Critical</div>
      </div>
    </div>
  );
});
