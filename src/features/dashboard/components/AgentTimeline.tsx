import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../DashboardStore';
import { CheckCircle2, Circle, ArrowDown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './AgentTimeline.module.css';

const PIPELINE_STEPS = [
  { id: 'receive', label: 'Receive' },
  { id: 'translate', label: 'Translate' },
  { id: 'classify', label: 'Classify' },
  { id: 'predict', label: 'Predict' },
  { id: 'recommend', label: 'Recommend' },
  { id: 'dispatch', label: 'Dispatch' },
];

export const AgentTimeline: React.FC = () => {
  const incidents = useDashboardStore(state => state.incidents);
  
  // Find top incident to determine pipeline state
  const topIncident = incidents.find(inc => 
    inc.status !== 'Resolved'
  );

  const [animatedStep, setAnimatedStep] = useState(-1);
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);

  // Target step based on incident state
  let targetStep = -1; // Default: Waiting
  if (topIncident) {
    if (topIncident.status === 'Assigned' || topIncident.status === 'Responding') {
      targetStep = 5; // Dispatch complete
    } else {
      targetStep = 4; // Up to Recommend complete
    }
  }

  // Sync state with props during render instead of effect to avoid cascading renders
  const currentTopId = topIncident?.id ?? null;
  if (currentTopId !== activeIncidentId) {
    setActiveIncidentId(currentTopId);
    if (currentTopId) {
      setAnimatedStep(0);
    } else {
      setAnimatedStep(-1);
    }
  }

  // Effect to handle animation sequencing
  useEffect(() => {
    if (topIncident && animatedStep < targetStep) {
      // Progress the animation
      const timer = setTimeout(() => {
        setAnimatedStep(prev => Math.min(prev + 1, targetStep));
      }, 600); // 600ms delay between steps
      return () => clearTimeout(timer);
    }
  }, [topIncident, activeIncidentId, targetStep, animatedStep]);

  return (
    <div className={styles.pipelineContainer}>
      {PIPELINE_STEPS.map((step, index) => {
        const isCompleted = index <= animatedStep;
        const isCurrent = index === animatedStep + 1 && animatedStep !== 5 && animatedStep !== -1;
        const isWaitingFirst = animatedStep === -1 && index === 0;

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
