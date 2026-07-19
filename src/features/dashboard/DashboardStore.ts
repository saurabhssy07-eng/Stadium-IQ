import { create } from 'zustand';
import type { Fan, Incident, OrchestratorLog, ZoneMetrics, SystemHealth } from '../../types';

interface DashboardState {
  fans: Fan[];
  incidents: Incident[];
  executionTimeline: OrchestratorLog[];
  zones: Record<string, ZoneMetrics>;
  aiHealth: SystemHealth;
  isInitializing: boolean;
  toastMsg: { id: number, msg: string } | null;
  selectedIncidentId: string | null;
  
  // Actions
  setInitialization: (status: boolean) => void;
  updateStadiumState: (fans: Fan[], zones: Record<string, ZoneMetrics>) => void;
  addIncident: (incident: Incident) => void;
  updateIncident: (incidentId: string, updates: Partial<Incident>) => void;
  addTimelineLog: (log: OrchestratorLog) => void;
  updateTimelineLog: (agentName: string, status: 'Completed' | 'Failed') => void;
  updateHealth: (updates: Partial<SystemHealth>) => void;
  executeRecommendation: (incidentId: string) => void;
  showToast: (msg: string) => void;
  clearToast: (id: number) => void;
  setSelectedIncident: (id: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  fans: [],
  incidents: [],
  executionTimeline: [],
  zones: {},
  aiHealth: {
    status: 'Healthy',
    latencyMs: 120,
    eventsProcessed: 0,
    agentsOnline: 6,
    totalAgents: 6,
    predictionAccuracy: 98,
  },
  isInitializing: true,
  toastMsg: null,
  selectedIncidentId: null,

  setInitialization: (status) => set({ isInitializing: status }),
  
  updateStadiumState: (fans, zones) => set({ fans, zones }),
  
  addIncident: (incident) => set((state) => ({ 
    incidents: [incident, ...state.incidents] 
  })),
  
  updateIncident: (id, updates) => set((state) => ({
    incidents: state.incidents.map(inc => inc.id === id ? { ...inc, ...updates } : inc)
  })),
  
  addTimelineLog: (log) => set((state) => ({
    executionTimeline: [log, ...state.executionTimeline]
  })),
  
  updateTimelineLog: (agentName, status) => set((state) => {
    const newTimeline = [...state.executionTimeline];
    const logIndex = newTimeline.findIndex(l => l.agentName === agentName && l.status === 'Pending');
    if (logIndex !== -1) {
      newTimeline[logIndex] = { ...newTimeline[logIndex], status };
    }
    return { executionTimeline: newTimeline };
  }),
  
  updateHealth: (updates) => set((state) => ({
    aiHealth: { ...state.aiHealth, ...updates }
  })),

  showToast: (msg) => {
    const id = Date.now();
    set({ toastMsg: { id, msg } });
    setTimeout(() => {
      set((state) => state.toastMsg?.id === id ? { toastMsg: null } : state);
    }, 3000);
  },
  
  clearToast: (id) => set((state) => state.toastMsg?.id === id ? { toastMsg: null } : state),
  
  setSelectedIncident: (id) => set({ selectedIncidentId: id }),

  executeRecommendation: (incidentId) => set((state) => {
    // 1. Update incident
    const incidents = state.incidents.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'Assigned' as const,
          assignee: 'Team Alpha',
          eta: '3.2 min'
        };
      }
      return inc;
    });
    
    // 2. Add log to timeline
    const log: OrchestratorLog = {
      timestamp: Date.now(),
      agentName: 'Response Agent',
      action: 'Dispatch Complete',
      status: 'Completed'
    };
    
    return {
      incidents,
      executionTimeline: [log, ...state.executionTimeline]
    };
  })
}));

export const selectKPIs = (state: DashboardState) => {
  const activeIncidents = state.incidents.filter(i => i.status !== 'Resolved');
  const resolvedCount = state.incidents.length - activeIncidents.length;
  
  const attendance = 82431 - activeIncidents.length * 42;
  const avgResponse = 38 + activeIncidents.length * 12;
  const accuracy = Math.max(85, 98 - activeIncidents.length);
  const resolvedRate = state.incidents.length > 0 ? Math.round((resolvedCount / state.incidents.length) * 100) : 100;

  return { attendance, avgResponse, accuracy, resolvedRate, incidentCount: state.incidents.length };
};
