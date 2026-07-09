import React, { useEffect, useRef, useState } from 'react';
import { Terminal, X, Minimize2, Maximize2 } from 'lucide-react';
import styles from './CommandCenterChat.module.css';
import { useDashboardStore } from '../DashboardStore';

export const CommandCenterChat: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: 'AI' | 'Operator'; text: string; id: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to incidents to auto-generate chat logs
  useEffect(() => {
    const unsub = useDashboardStore.subscribe((state, prevState) => {
      // Find new incidents or status changes
      state.incidents.forEach(inc => {
        const prev = prevState.incidents.find(p => p.id === inc.id);
        
        if (!prev) {
          // New incident
          addMessage('AI', `🚨 ${inc.severity.toUpperCase()} ALERT: ${inc.rawText} at ${inc.location.zoneId}`);
        } else if (prev.status !== inc.status) {
          if (inc.status === 'Assigned') {
            addMessage('AI', `Team assigned to ${inc.location.zoneId}.`);
            setTimeout(() => addMessage('Operator', 'Confirmed. En route.'), 1500);
          }
          if (inc.status === 'Responding') {
            addMessage('AI', `Team arrived at ${inc.location.zoneId}. Commencing resolution.`);
          }
          if (inc.status === 'Resolved') {
            addMessage('Operator', `Incident at ${inc.location.zoneId} resolved.`);
            setTimeout(() => addMessage('AI', `Logging resolution. Closing ticket.`), 1000);
          }
        }
      });
    });

    // Initial greeting
    setTimeout(() => {
      addMessage('AI', 'System Online. Monitoring 14 zones.');
    }, 500);

    return unsub;
  }, []);

  const addMessage = (sender: 'AI' | 'Operator', text: string) => {
    setMessages(prev => [...prev, { sender, text, id: `${Date.now()}-${Math.random()}` }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  return (
    <div className={`${styles.chatContainer} ${isMinimized ? styles.minimized : ''}`}>
      <div className={styles.chatHeader} onClick={() => setIsMinimized(!isMinimized)}>
        <div className={styles.headerTitle}>
          <Terminal size={14} />
          <span>CMD CENTER</span>
        </div>
        <div className={styles.headerActions}>
          {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
        </div>
      </div>
      
      {!isMinimized && (
        <div className={styles.chatBody} ref={scrollRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${styles[msg.sender.toLowerCase()]}`}>
              <div className={styles.sender}>{msg.sender}</div>
              <div className={styles.text}>{msg.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
