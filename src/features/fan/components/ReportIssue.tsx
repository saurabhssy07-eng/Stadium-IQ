import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stadiumEventBus } from '../../../simulation/EventBus';
import { Mic, Camera, ArrowLeft, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ReportIssue.module.css';

export const ReportIssue: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [issue, setIssue] = useState('Spill');
  const [location, setLocation] = useState('Gate B');
  const [description, setDescription] = useState('People are slipping near Gate B.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaMsg, setMediaMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Push event into the global event bus -> orchestrator -> dashboard
      stadiumEventBus.publish({
        id: `fan_rep_${Date.now()}`,
        timestamp: Date.now(),
        source: 'FAN_APP',
        type: 'HAZARD',
        priority: 'High',
        location: { x: 45, y: 35, zoneId: location || 'Unknown Sec' },
        payload: { message: issue }
      });
      
      // Send user to the AI interaction screen to wait for resolution
      navigate('/fan/ai-conversation');
    }, 500);
  };

  const handleMediaClick = () => {
    setMediaMsg('Hardware integration simulated for demo purposes.');
    setTimeout(() => setMediaMsg(''), 3000);
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <header className={styles.header}>
        <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate('/fan')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.title}>Report Issue</div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>What's happening?</label>
          <textarea 
            placeholder="Describe the issue (e.g., Spill in aisle 4, medical emergency)" 
            className={styles.textarea}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Location (Optional)</label>
          <div className={styles.locationInputGroup}>
            <MapPin size={18} className={styles.locationIcon} />
            <input 
              type="text" 
              placeholder="e.g. Sec 112, Row F" 
              className={styles.inputField}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.mediaRow}>
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Record voice note"
            onClick={handleMediaClick}
          >
            <Mic size={18} /> Voice
          </button>
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Take photo"
            onClick={handleMediaClick}
          >
            <Camera size={18} /> Photo
          </button>
        </div>
        <div
          id="mediaMsg"
          aria-live="polite"
          style={{
            color: 'var(--color-success, #4ade80)',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            padding: mediaMsg ? '0.5rem' : '0',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginTop: '-0.5rem',
            marginBottom: '1rem',
            minHeight: mediaMsg ? '1.2rem' : '0',
            opacity: mediaMsg ? 1 : 0,
            textAlign: 'center',
            transition: 'all 200ms ease',
            overflow: 'hidden'
          }}
        >
          {mediaMsg}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </motion.div>
  );
});
