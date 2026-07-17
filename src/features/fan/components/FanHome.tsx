import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Coffee, ShieldPlus, TriangleAlert, Mic, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './FanHome.module.css';

export const FanHome: React.FC = () => {
  return (
    <motion.div 
      className={styles.homeContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <header className={styles.header}>
        <div className={styles.brand}>🏟 StadiumIQ</div>
        <h1 className={styles.greeting}>Good Evening, Mateo</h1>
        <div className={styles.matchInfo}>
          <span className={styles.matchTeams}>USA vs ESP</span>
          <span className={styles.matchTime}>42:15</span>
        </div>
      </header>

      <div className={styles.actionGrid}>
        <div className={`${styles.actionBtn} ${styles.primary}`}>
          <Navigation size={24} />
          <span className={styles.btnLabel}>Navigate</span>
        </div>
        <div className={styles.actionBtn}>
          <Coffee size={24} />
          <span className={styles.btnLabel}>Food</span>
        </div>
        <div className={styles.actionBtn}>
          <ShieldPlus size={24} />
          <span className={styles.btnLabel}>Medical</span>
        </div>
        <Link to="/fan/report" className={`${styles.actionBtn} ${styles.danger}`}>
          <TriangleAlert size={24} />
          <span className={styles.btnLabel}>Report Issue</span>
        </Link>
      </div>

      <div className={styles.assistantSection}>
        <div className={styles.assistantTitle}>
          <Bot size={18} /> AI Assistant
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          "What can I help you with?"
        </p>
        <Link to="/fan/ai-conversation" className={styles.micBtn} aria-label="Start voice assistant">
          <Mic size={28} />
        </Link>
      </div>
    </motion.div>
  );
};
