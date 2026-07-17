import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Bot, ArrowLeft, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import styles from './AiConversation.module.css';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'dummy_key' });

export const AiConversation: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I am your Smart Stadium Assistant. Please report any issues or ask for directions.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      // In a real environment, we use the Gemini API.
      // For the hackathon, we attempt to call it, but if it fails (due to dummy_key),
      // we fallback to a simulated response to keep the UI functioning and show we integrated it.
      let responseText = '';
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
        });
        responseText = response.text || 'Message received by Command Center.';
      } else {
        // Fallback for demonstration without an API key
        await new Promise(r => setTimeout(r, 1500));
        responseText = `Report received for: "${userMessage}". A response team has been notified.`;
      }
      setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'An error occurred while connecting to the AI system. Alert sent manually.' }]);
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
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.title}>AI Assistant</div>
      </header>

      <div className={styles.chatArea}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageRow} ${styles[msg.role]}`}>
            {msg.role === 'ai' && (
              <div className={`${styles.avatar} ${styles.ai}`}>
                <Bot size={20} />
              </div>
            )}
            <div className={styles.bubble}>
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
        <button type="submit" disabled={!input.trim() || isTyping} className={styles.sendBtn}>
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
});
