import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stadiumEventBus } from '../../../simulation/EventBus';
import { Mic, Camera, ArrowLeft, MapPin, Square, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './ReportIssue.module.css';

export const ReportIssue: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [issue, setIssue] = useState('Spill');
  const [location, setLocation] = useState('Gate B');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaMsg, setMediaMsg] = useState('');
  
  // Media states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceAttached, setVoiceAttached] = useState<number | null>(null);
  
  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      stadiumEventBus.publish({
        id: `fan_rep_${Date.now()}`,
        timestamp: Date.now(),
        source: 'FAN_APP',
        type: 'HAZARD',
        priority: 'High',
        location: { x: 45, y: 35, zoneId: location || 'Unknown Sec' },
        payload: { message: issue, hasImage: !!attachedImage, hasAudio: !!voiceAttached }
      });
      navigate('/fan/ai-conversation', { state: { reportedIssue: true, issueSummary: issue } });
    }, 500);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this. For demo, we just preview it.
      const url = URL.createObjectURL(file);
      setAttachedImage(url);
      setMediaMsg('Photo successfully attached.');
      setTimeout(() => setMediaMsg(''), 3000);
    }
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setVoiceAttached(recordingTime);
      setMediaMsg(`Voice note attached (${recordingTime}s)`);
      setTimeout(() => setMediaMsg(''), 3000);
    } else {
      // Start recording
      setIsRecording(true);
      setRecordingTime(0);
      setVoiceAttached(null);
      setMediaMsg('');
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
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
          <input 
            type="file" 
            accept="image/*,video/*" 
            capture="environment"
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Record voice note"
            onClick={handleVoiceClick}
            style={{ 
              borderColor: isRecording ? 'var(--color-danger)' : 'rgba(255, 255, 255, 0.1)',
              color: isRecording ? 'var(--color-danger)' : 'var(--color-text-primary)'
            }}
          >
            {isRecording ? (
              <><Square size={18} fill="currentColor" /> {recordingTime}s</>
            ) : (
              <><Mic size={18} /> {voiceAttached ? `${voiceAttached}s` : 'Voice'}</>
            )}
          </button>
          
          <button 
            type="button" 
            className={styles.mediaBtn} 
            aria-label="Take photo"
            onClick={handlePhotoClick}
            style={{ 
              borderColor: attachedImage ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)',
              color: attachedImage ? 'var(--color-primary)' : 'var(--color-text-primary)'
            }}
          >
            {attachedImage ? (
              <><ImageIcon size={18} /> Attached</>
            ) : (
              <><Camera size={18} /> Photo</>
            )}
          </button>
        </div>
        
        {/* Preview Area if image attached */}
        {attachedImage && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-0.5rem' }}>
            <img 
              src={attachedImage} 
              alt="Attached preview" 
              style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>
        )}

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

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting || isRecording}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </motion.div>
  );
});
