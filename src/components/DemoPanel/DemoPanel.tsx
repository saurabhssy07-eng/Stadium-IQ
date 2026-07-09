import React, { useState } from 'react';
import { Settings, X, Play } from 'lucide-react';
import { stadiumEventBus } from '../../simulation/EventBus';
import styles from './DemoPanel.module.css';

export const DemoPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const triggerEvent = (type: string, priority: 'Low'|'Medium'|'High'|'Critical', zoneId: string, message: string) => {
    stadiumEventBus.publish({
      id: `demo_evt_${Date.now()}`,
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type,
      priority,
      location: { x: 45, y: 35, zoneId }, // Mocked center coordinate for demo purposes
      payload: { message }
    });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button className={styles.toggleBtn} onClick={() => setIsOpen(true)} title="Open Demo Panel">
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4>Smart Demo Mode</h4>
        <button onClick={() => setIsOpen(false)}><X size={16} /></button>
      </div>
      
      <div className={styles.scenarioList}>
        <button onClick={() => triggerEvent('HAZARD', 'High', 'Gate B', 'Huge Spill detected near Gate B')} className={styles.scenarioBtn}>
          <Play size={14} /> Scenario 1: Huge Spill
        </button>
        <button onClick={() => triggerEvent('MEDICAL', 'Critical', 'Food Court', 'Medical Emergency reported')} className={styles.scenarioBtn}>
          <Play size={14} /> Scenario 2: Medical Emergency
        </button>
        <button onClick={() => triggerEvent('SECURITY', 'High', 'Gate A', 'Lost Child reported')} className={styles.scenarioBtn}>
          <Play size={14} /> Scenario 3: Lost Child
        </button>
        <button onClick={() => triggerEvent('CROWD_DENSITY', 'High', 'Gate C', 'Sudden crowd surge detected')} className={styles.scenarioBtn}>
          <Play size={14} /> Scenario 4: Crowd Surge
        </button>
      </div>
    </div>
  );
};
