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
  private async simulateAgentPipeline(_event: StadiumEvent, _incidentId: string) {
    this.addLog('Ingestion', 'Report Received', 'Pending');
    await this.delay(200);
    this.updateLastLog('Ingestion', 'Completed');

    // Simulate Communication Agent (Translation)
    this.addLog('Communication Agent', 'Translation & Parsing', 'Pending');
    await this.delay(400);
    this.updateLastLog('Communication Agent', 'Completed');

    // Simulate Incident Agent (Classification)
    this.addLog('NLP Engine', 'Severity Analysis', 'Pending');
    await this.delay(600);
    this.updateLastLog('NLP Engine', 'Completed');

    // Simulate Crowd Agent (Prediction)
    this.addLog('Simulation Twin', 'Crowd Prediction', 'Pending');
    await this.delay(500);
    this.updateLastLog('Simulation Twin', 'Completed');
    
    // Simulate Route Optimization
    this.addLog('Pathfinding', 'Route Optimization', 'Pending');
    await this.delay(400);
    this.updateLastLog('Pathfinding', 'Completed');
    
    // Simulate Response Agent (Dispatch)
    this.addLog('Response Agent', 'Volunteer Assignment', 'Pending');
    await this.delay(300);
    this.updateLastLog('Response Agent', 'Completed');

    // Update the incident with the generated recommendation
    const store = useDashboardStore.getState();
    const incident = store.incidents.find(i => i.id === _incidentId);
    if (incident) {
      store.updateIncident(_incidentId, {
        reason: `Dispatch Team Alpha to ${incident.location.zoneId} and redirect nearby crowd flow.`
      });
    }

    this.addLog('Orchestrator', 'Recommendation Published', 'Completed');
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
