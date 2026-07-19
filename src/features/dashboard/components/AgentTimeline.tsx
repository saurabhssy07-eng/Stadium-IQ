import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../DashboardStore';
import { CheckCircle2, Circle, ArrowDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './AgentTimeline.module.css';

const PIPELINE_STEPS = [
  { id: 'receive', label: 'Receive', agents: ['Ingestion'] },
  { id: 'translate', label: 'Translate', agents: ['Communication Agent'] },
  { id: 'classify', label: 'Classify', agents: ['NLP Engine'] },
  { id: 'predict', label: 'Predict', agents: ['Simulation Twin', 'Pathfinding'] },
  { id: 'recommend', label: 'Recommend', agents: ['Response Agent', 'Orchestrator'] },
  { id: 'dispatch', label: 'Dispatch', agents: ['Dispatch Complete'] }, // "Dispatch Complete" is used in DashboardStore
];

export const AgentTimeline: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  const timelineLogs = useDashboardStore(state => state.executionTimeline);
  
  // Find top incident to determine pipeline state
  const topIncident = incidents.find(inc => inc.status !== 'Resolved');

  return (
    <div className={styles.pipelineContainer}>
      {PIPELINE_STEPS.map((step, index) => {
        // Derive state purely from logs
        let isCompleted = false;
        let isCurrent = false;

        if (topIncident) {
           if (index === 5 && (topIncident.status === 'Assigned' || topIncident.status === 'Responding')) {
             isCompleted = true;
           } else {
             // Check if any agent mapped to this step is Completed
             isCompleted = timelineLogs.some(log => step.agents.includes(log.agentName) && log.status === 'Completed') ||
                           timelineLogs.some(log => step.agents.includes(log.action) && log.status === 'Completed');
             
             // If not completed, check if it's currently pending
             if (!isCompleted) {
                isCurrent = timelineLogs.some(log => step.agents.includes(log.agentName) && log.status === 'Pending');
             }
           }
        }

        const isWaitingFirst = !topIncident && index === 0;

        return (
          <React.Fragment key={step.id}>
            <div className={`${styles.stepRow} ${isCompleted ? styles.completed : ''} ${(isCurrent || isWaitingFirst) ? styles.active : ''}`}>
              <div className={styles.stepName}>
                {step.label}
                {isCurrent && <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>...</motion.span>}
              </div>
              <div className={styles.stepIcon}>
                {isCompleted ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <CheckCircle2 size={18} className={styles.iconCompleted} />
                  </motion.div>
                ) : (isCurrent || isWaitingFirst) ? (
                  isCurrent ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                      <Loader2 size={18} className={styles.iconActive} />
                    </motion.div>
                  ) : (
                    <Circle size={18} className={styles.iconActive} />
                  )
                ) : (
                  <Circle size={18} className={styles.iconPending} />
                )}
              </div>
            </div>
            
            {/* Draw connecting arrow except for the last step */}
            {index < PIPELINE_STEPS.length - 1 && (
              <div className={styles.arrowRow}>
                <ArrowDown size={14} className={`${styles.arrowIcon} ${isCompleted ? styles.arrowCompleted : styles.arrowPending}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
