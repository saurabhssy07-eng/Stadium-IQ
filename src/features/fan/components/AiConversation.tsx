import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Bot, ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './AiConversation.module.css';

export const AiConversation: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 3200),
      setTimeout(() => setStep(4), 4500)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: 'Translating input...' },
    { label: 'Understanding context...' },
    { label: 'Classifying hazard...' },
    { label: 'Sending to Command Center...' }
  ];

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.title}>AI Assistant</div>
      </header>

      <div className={styles.chatArea}>
        <div className={`${styles.messageRow} ${styles.user}`}>
          <div className={styles.bubble}>
            "People are slipping near Gate B. Please send help!"
          </div>
        </div>

        <div className={`${styles.messageRow} ${styles.ai}`}>
          <div className={`${styles.avatar} ${styles.ai}`}>
            <Bot size={20} />
          </div>
          <div className={styles.bubble}>
            <div className={styles.stepList}>
              {steps.map((s, idx) => {
                const isCompleted = step > idx;
                const isActive = step === idx;
                if (idx > step) return null; // hide future steps

                return (
                  <div key={idx} className={`${styles.step} ${isCompleted ? styles.completed : isActive ? styles.active : ''}`}>
                    {isCompleted ? <CheckCircle2 size={16} className={styles.completedIcon} /> : <Loader2 size={16} className={styles.pendingIcon} />}
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {step >= 4 && (
          <div className={styles.actionCard}>
            Report received! A response team has been dispatched to Gate B.
          </div>
        )}
      </div>
    </motion.div>
  );
};
