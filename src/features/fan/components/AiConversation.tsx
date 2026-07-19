import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, Send, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './AiConversation.module.css';

export const AiConversation: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: 'user' | 'ai' | 'system', content: string}[]>([
    { role: 'ai', content: 'Hello! I am your Smart Stadium Assistant. I can help with general stadium info and directions.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fallback) {
          setIsDemoMode(true);
          setMessages(prev => [...prev, { role: 'system', content: `Demo Mode Activated: ${data.message || 'Server requested fallback'}` }]);
          await new Promise(r => setTimeout(r, 1500));
          setMessages(prev => [...prev, { role: 'ai', content: data.text || `[Simulated Response] Report received for: "${userMessage}". A response team has been notified.` }]);
        } else {
          setMessages(prev => [...prev, { role: 'ai', content: data.text || 'Message received by Command Center.' }]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown Server Error' }));
        setIsDemoMode(true);
        setMessages(prev => [...prev, { role: 'system', content: `Demo Mode Activated: ${errorData.message || 'API Key not configured on server'}` }]);
        await new Promise(r => setTimeout(r, 1500));
        setMessages(prev => [...prev, { role: 'ai', content: `[Simulated Response] Report received for: "${userMessage}". A response team has been notified.` }]);
      }
    } catch {
      setIsDemoMode(true);
      setMessages(prev => [...prev, { role: 'system', content: 'Demo Mode Activated: Fallback engaged due to network error.' }]);
      setMessages(prev => [...prev, { role: 'ai', content: '[Simulated Response] Alert sent manually.' }]);
    } finally {
      setIsTyping(false);
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
        <div className={styles.title}>
          AI Assistant {isDemoMode && <span className={styles.demoBadge}>Demo Mode</span>}
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontWeight: 'normal', marginTop: '2px' }}>
            General info only. For emergencies, please use the Report tool.
          </div>
        </div>
      </header>

      <div className={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageRow} ${styles[msg.role]}`}>
            {msg.role === 'ai' && (
              <div className={`${styles.avatar} ${styles.ai}`}>
                <Bot size={20} />
              </div>
            )}
            {msg.role === 'system' && (
              <div className={styles.systemIcon}>
                <Info size={16} />
              </div>
            )}
            <div className={`${styles.bubble} ${msg.role === 'system' ? styles.systemBubble : ''}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.messageRow} ${styles.ai}`}>
             <div className={`${styles.avatar} ${styles.ai}`}>
                <Loader2 size={20} className={styles.pendingIcon} />
             </div>
             <div className={styles.bubble}>Processing report...</div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSend} className={styles.inputForm}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your issue..." 
          className={styles.inputField}
        />
        <button type="submit" disabled={!input.trim() || isTyping} className={styles.sendBtn} aria-label="Send message">
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
});
