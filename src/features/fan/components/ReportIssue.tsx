import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { stadiumEventBus } from '../../../simulation/EventBus';
import { Mic, Camera, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ReportIssue.module.css';

export const ReportIssue: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [issue, setIssue] = useState('Spill');
  const [location, setLocation] = useState('Gate B');
  const [description, setDescription] = useState('People are slipping near Gate B.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      // Push event into the global event bus -> orchestrator -> dashboard
      stadiumEventBus.publish({
        id: `fan_evt_${Date.now()}`,
        timestamp: Date.now(),
        source: 'FAN_APP',
        type: 'HAZARD_REPORT',
        priority: 'High',
        location: { x: 15, y: 45, zoneId: location }, 
        payload: { message: `[Fan Report] ${issue}: ${description}` }
      });
      
      // Send user to the AI interaction screen to wait for resolution
      navigate('/fan/ai-conversation');
    }, 500);
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <header className={styles.header}>
        <button className={styles.backBtn} aria-label="Go back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.title}>Report Issue</div>
      </header>

      <form className={styles.form} onSubmit={handleSubmit} aria-label="Report Issue Form">
        <div className={styles.field}>
          <label htmlFor="issueType" className={styles.label}>Issue</label>
          <select id="issueType" className={styles.select} value={issue} onChange={e => setIssue(e.target.value)}>
            <option value="Spill">Spill / Hazard</option>
            <option value="Medical">Medical Emergency</option>
            <option value="Security">Security Concern</option>
            <option value="Facility">Facility Damage</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="issueLocation" className={styles.label}>Location</label>
          <select id="issueLocation" className={styles.select} value={location} onChange={e => setLocation(e.target.value)}>
            <option value="Gate A">Gate A</option>
            <option value="Gate B">Gate B</option>
            <option value="Gate C">Gate C</option>
            <option value="Food Court">Food Court</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="issueDescription" className={styles.label}>Description</label>
          <textarea 
            id="issueDescription"
            className={styles.textarea} 
            value={description}
            onChange={e => setDescription(e.target.value)}
            aria-required="true"
          />
        </div>

        <div className={styles.mediaRow}>
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Record voice note"
            onClick={() => alert('Hardware integration simulated for demo purposes.')}
          >
            <Mic size={18} /> Voice
          </button>
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Take photo"
            onClick={() => alert('Hardware integration simulated for demo purposes.')}
          >
            <Camera size={18} /> Photo
          </button>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </motion.div>
  );
});
