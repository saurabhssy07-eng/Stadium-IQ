import { stadiumEventBus } from '../simulation/EventBus';
import type { StadiumEvent, OrchestratorLog, Incident } from '../types';
import { useDashboardStore } from '../features/dashboard/DashboardStore';

export class Orchestrator {
  private executionLogs: OrchestratorLog[] = [];

  constructor() {
    // 1. Listen to the Event Bus (Digital Twin -> Event Bus -> Orchestrator)
    stadiumEventBus.subscribe(this.handleEvent.bind(this));
  }

  private handleEvent(event: StadiumEvent) {
    if (event.status !== 'New') return;
    
    console.log(`[Orchestrator] Processing Event: ${event.type}`);
    
    // 1. Create the initial incident in the global store
    const incident: Incident = {
      id: `inc_${Date.now()}`,
      timestamp: Date.now(),
      rawText: (event.payload as Record<string, unknown>)?.message as string || 'System Anomaly Detected',
      language: 'en',
      location: event.location,
      type: event.type,
      severity: event.priority === 'High' ? 'High' : 'Medium',
      confidence: 0,
      reason: 'Awaiting AI Analysis...',
      status: 'Reported'
    };
    useDashboardStore.getState().addIncident(incident);

    // 2. Trigger the multi-agent pipeline
    this.simulateAgentPipeline(event, incident.id);
  }
  
  // 2. The Multi-Agent Timeline Execution
  private async simulateAgentPipeline(event: StadiumEvent, _incidentId: string) {
    this.addLog('Ingestion', 'Report Received', 'Pending');
    await this.delay(200);
    this.updateLastLog('Ingestion', 'Completed');

    // Simulate Communication Agent (Translation)
    this.addLog('Communication Agent', 'Translation & Parsing', 'Pending');
    await this.delay(400);
    this.updateLastLog('Communication Agent', 'Completed');

    this.addLog('NLP Engine', 'AI Severity Analysis', 'Pending');

    try {
      const response = await fetch('/api/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: (event.payload as Record<string, unknown>)?.message || '',
          type: event.type,
          priority: event.priority,
          location: event.location
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fallback) {
          // Explicitly break out of try block to hit the Demo Simulation fallback pipeline below
          console.warn('AI Orchestrator API requested fallback:', data.message);
        } else {
          this.updateLastLog('NLP Engine', 'Completed');
          
          this.addLog('Pathfinding', 'AI Route Optimization', 'Pending');
          await this.delay(200);
          this.updateLastLog('Pathfinding', 'Completed');
          
          this.addLog('Response Agent', 'AI Team Assignment', 'Pending');
          await this.delay(200);
          this.updateLastLog('Response Agent', 'Completed');

          const store = useDashboardStore.getState();
          const incident = store.incidents.find(i => i.id === _incidentId);
          if (incident) {
            store.updateIncident(_incidentId, {
              severity: data.severity || incident.severity,
              confidence: data.confidence || 90,
              assignee: data.assignee || 'Team Alpha',
              reason: data.recommendation || 'AI recommendation unavailable'
            });
          }
          this.addLog('Orchestrator', 'AI Recommendation Published', 'Completed');
          return; // Exit if real AI succeeded
        }
      }
    } catch (e) {
      console.warn('AI Orchestrator API failed, falling back to demo simulation', e);
    }

    // Fallback pipeline (if API fails or keys missing)
    this.updateLastLog('NLP Engine', 'Completed');

    // Simulate Crowd Agent (Prediction)
    this.addLog('Simulation Twin', 'Crowd Prediction (Demo)', 'Pending');
    await this.delay(500);
    this.updateLastLog('Simulation Twin', 'Completed');
    
    // Simulate Route Optimization
    this.addLog('Pathfinding', 'Route Optimization (Demo)', 'Pending');
    await this.delay(400);
    this.updateLastLog('Pathfinding', 'Completed');
    
    // Simulate Response Agent (Dispatch)
    this.addLog('Response Agent', 'Volunteer Assignment (Demo)', 'Pending');
    await this.delay(300);
    this.updateLastLog('Response Agent', 'Completed');

    // Update the incident with the generated recommendation
    const store = useDashboardStore.getState();
    const incident = store.incidents.find(i => i.id === _incidentId);
    if (incident) {
      store.updateIncident(_incidentId, {
        reason: `[Demo] Dispatch Team Alpha to ${incident.location.zoneId} and redirect nearby crowd flow.`,
        confidence: 97
      });
    }

    this.addLog('Orchestrator', 'Demo Recommendation Published', 'Completed');
  }

  private addLog(agentName: string, action: string, status: 'Pending' | 'Completed' | 'Failed') {
    const log: OrchestratorLog = {
      timestamp: Date.now(),
      agentName,
      action,
      status
    };
    this.executionLogs.push(log);
    
    // Dispatch to global UI store
    useDashboardStore.getState().addTimelineLog(log);
  }

  private updateLastLog(agentName: string, status: 'Completed' | 'Failed') {
    if (this.executionLogs.length > 0) {
      this.executionLogs[this.executionLogs.length - 1].status = status;
    }
    
    // Dispatch to global UI store
    useDashboardStore.getState().updateTimelineLog(agentName, status);
  }

  public getLogs() {
    return this.executionLogs;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global Singleton Instance
export const stadiumOrchestrator = new Orchestrator();
