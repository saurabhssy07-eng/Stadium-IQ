import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FanHome } from './components/FanHome';
import { ReportIssue } from './components/ReportIssue';
import { AiConversation } from './components/AiConversation';
import styles from './FanLayout.module.css';

export const FanLayout: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      <div className={styles.mobileFrame}>
        <Routes>
          <Route path="/" element={<FanHome />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/ai-conversation" element={<AiConversation />} />
        </Routes>
      </div>
    </div>
  );
};
