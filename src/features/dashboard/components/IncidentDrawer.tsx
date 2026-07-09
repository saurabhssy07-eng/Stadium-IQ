import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Target, Users, Zap, CheckCircle, ShieldAlert } from 'lucide-react';
import { useDashboardStore } from '../DashboardStore';
import { stadiumEventBus } from '../../../simulation/EventBus';
import styles from './IncidentDrawer.module.css';

export const IncidentDrawer: React.FC = () => {
  const selectedIncidentId = useDashboardStore(state => state.selectedIncidentId);
  const incidents = useDashboardStore(state => state.incidents);
  const executeRecommendation = useDashboardStore(state => state.executeRecommendation);
  const showToast = useDashboardStore(state => state.showToast);
  const setSelectedIncident = useDashboardStore(state => state.setSelectedIncident);

  const incident = incidents.find(inc => inc.id === selectedIncidentId);

  return (
    <AnimatePresence>
      {incident && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedIncident(null)}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.drawer}
            onClick={(e: React.MouseEvent) => e.stopPropagation()} // prevent overlay click
          >
            <div className={styles.header}>
              <div className={styles.title}>
                {incident.severity === 'Critical' ? <ShieldAlert color="var(--color-crit)" /> : <Target color="var(--color-ai)" />}
                Incident #{incident.id.split('_')[1]?.substring(0, 4) || '341'}
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedIncident(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.content}>
              {/* Map Placeholder */}
              <div className={styles.mapSection}>
                <h4>Live Map Focus</h4>
                <div className={styles.miniMap}>
                  <MapPin size={24} />
                  <span>{incident.location.zoneId}</span>
                  <div className={styles.mapPulse} />
                </div>
              </div>

              {/* Stats */}
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Confidence</span>
                  <span className={styles.statValue} style={{ color: 'var(--color-ai)' }}>{incident.confidence || 88}%</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Severity</span>
                  <span className={styles.statValue}>{incident.severity.toUpperCase()}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Status</span>
                  <span className={styles.statValue}>{incident.status.toUpperCase()}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Assignee</span>
                  <span className={styles.statValue}>{incident.assignee || 'Pending'}</span>
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className={styles.timeline}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Investigation Timeline</h4>
                <div className={styles.timelineRow}>
                  <div className={styles.timelineTime}>{new Date(incident.timestamp).toLocaleTimeString([], { hour12: false })}</div>
                  <div className={styles.timelineNode}><div className={styles.timelineDot} /></div>
                  <div className={styles.timelineText}>Sensor anomaly detected</div>
                </div>
                <div className={styles.timelineRow}>
                  <div className={styles.timelineTime}>{new Date(incident.timestamp + 2000).toLocaleTimeString([], { hour12: false })}</div>
                  <div className={styles.timelineNode}><div className={styles.timelineDot} /></div>
                  <div className={styles.timelineText}>Crowd Agent classified</div>
                </div>
                <div className={styles.timelineRow}>
                  <div className={styles.timelineTime}>{new Date(incident.timestamp + 4000).toLocaleTimeString([], { hour12: false })}</div>
                  <div className={styles.timelineNode}><div className={styles.timelineDot} /></div>
                  <div className={styles.timelineText}>Recommendation generated</div>
                </div>
                {incident.status !== 'Reported' && (
                  <div className={styles.timelineRow}>
                    <div className={styles.timelineTime}>{new Date(incident.timestamp + 6000).toLocaleTimeString([], { hour12: false })}</div>
                    <div className={styles.timelineNode}><div className={styles.timelineDot} /></div>
                    <div className={styles.timelineText}>Volunteer Assigned</div>
                  </div>
                )}
                {incident.status === 'Resolved' && (
                  <div className={styles.timelineRow}>
                    <div className={styles.timelineTime}>{new Date(incident.timestamp + 8000).toLocaleTimeString([], { hour12: false })}</div>
                    <div className={styles.timelineNode}><div className={styles.timelineDot} /></div>
                    <div className={styles.timelineText}>Resolved</div>
                  </div>
                )}
              </div>

              {/* AI Recommendation */}
              <div className={styles.recommendation}>
                <div className={styles.recHeader}>
                  <Zap size={16} /> AI Recommendation
                </div>
                <div className={styles.recBody}>
                  {incident.reason || 'Open secondary vendor lane and dispatch crowd management team.'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.footer}>
              {incident.status === 'Reported' ? (
                <button 
                  className={styles.dispatchBtn}
                  onClick={() => {
                    executeRecommendation(incident.id);
                    showToast(`Dispatched Alpha Team to ${incident.location.zoneId}`);
                    stadiumEventBus.publish({
                      id: `cmd_${Date.now()}`,
                      timestamp: Date.now(),
                      source: 'MANUAL',
                      type: 'DISPATCH',
                      priority: incident.severity,
                      location: incident.location,
                      payload: { action: `Dispatch team to ${incident.location.zoneId}` }
                    });
                  }}
                >
                  <Zap size={18} /> Execute AI Dispatch
                </button>
              ) : (
                <div className={styles.resolvedBtn}>
                  <CheckCircle size={18} /> Responding (ETA: {incident.eta || '2 min'})
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
