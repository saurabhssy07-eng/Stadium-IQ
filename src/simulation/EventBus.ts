import type { StadiumEvent } from '../types';

type EventListener = (event: StadiumEvent) => void;

class EventBus {
  private listeners: EventListener[] = [];
  private eventHistory: StadiumEvent[] = [];

  // Agents and Orchestrator subscribe here
  subscribe(listener: EventListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // The Digital Twin or UI pushes events here
  publish(event: Omit<StadiumEvent, 'status'>) {
    const fullEvent: StadiumEvent = {
      ...event,
      status: 'New',
    };
    
    this.eventHistory.push(fullEvent);
    
    // Notify all listeners instantly
    this.listeners.forEach(listener => listener(fullEvent));
  }

  getHistory() {
    return this.eventHistory;
  }

  // Utility for testing
  clear() {
    this.listeners = [];
    this.eventHistory = [];
  }
}

// Global Singleton Instance
export const stadiumEventBus = new EventBus();
