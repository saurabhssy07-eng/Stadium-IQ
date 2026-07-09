import React, { useState } from 'react';
import styles from './TabbedPanel.module.css';

export interface TabData {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabbedPanelProps {
  tabs: TabData[];
}

export const TabbedPanel: React.FC<TabbedPanelProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={styles.container}>
      <div className={styles.tabList}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
};
