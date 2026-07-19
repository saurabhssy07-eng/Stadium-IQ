import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Coffee, ShieldPlus, TriangleAlert, Mic, Bot, Camera } from 'lucide-react';
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
        <Link to="/fan/ai-conversation" className={`${styles.actionBtn} ${styles.primary}`}>
          <Navigation size={20} />
          <span className={styles.btnLabel}>Navigate</span>
        </Link>
        <Link to="/fan/ai-conversation" className={styles.actionBtn}>
          <Coffee size={20} />
          <span className={styles.btnLabel}>Food</span>
        </Link>
        <Link to="/fan/ai-conversation" className={styles.actionBtn}>
          <ShieldPlus size={20} />
          <span className={styles.btnLabel}>Medical</span>
        </Link>
        <Link to="/fan/report" className={`${styles.actionBtn} ${styles.danger}`}>
          <TriangleAlert size={20} />
          <span className={styles.btnLabel}>Report Issue</span>
        </Link>
      </div>

      <div className={styles.assistantSection}>
        <div className={styles.assistantTitle}>
          <Bot size={16} /> AI Assistant
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
          "What can I help you with?"
        </p>
        <Link to="/fan/ai-conversation" className={styles.micBtn} aria-label="Start voice assistant">
          <Mic size={20} />
        </Link>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
          <Link to="/fan/ai-conversation" style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Bot size={16} /> Open AI Chat
          </Link>
          <Link to="/fan/report" style={{ padding: '0.5rem 1rem', background: 'var(--color-surface)', borderRadius: '20px', textDecoration: 'none', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <Camera size={16} /> Upload Media
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
