// ==========================================
// StadiumIQ AI - Global Type Definitions
// ==========================================

// 1. Digital Stadium Twin Types & Event Bus
export type EventSource = 'IOT_SENSOR' | 'FAN_APP' | 'CCTV' | 'TICKET_SCANNER' | 'MANUAL';

export interface StadiumEvent {
  id: string;
  timestamp: number;
  source: EventSource;
  type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  location: Location;
  payload?: unknown;
  status: 'New' | 'Processing' | 'Processed' | 'Failed';
}

export interface Location {
  x: number;
  y: number;
  zoneId: string; // e.g., 'Gate A', 'Section 112'
}

export interface Fan {
  id: string;
  location: Location;
  isMoving: boolean;
  language: string;
}

export interface StadiumState {
  timestamp: number;
  fans: Fan[];
  activeIncidents: Incident[];
  zones: Record<string, ZoneMetrics>;
}

export interface ZoneMetrics {
  currentCapacity: number;
  maxCapacity: number;
  riskScore: number; // 0-100% predictive congestion risk
  status: 'normal' | 'moderate' | 'heavy' | 'critical';
}

// 2. Incident & Agent Contracts
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Incident {
  id: string;
  timestamp: number;
  rawText: string;
  language: string;
  location: Location;
  type: string;
  severity: IncidentSeverity;
  confidence: number;
  reason: string;
  status: 'Reported' | 'AI Verified' | 'Action_Required' | 'Assigned' | 'Responding' | 'Resolved';
  assignee?: string;
  eta?: string;
}

export interface OrchestratorLog {
  timestamp: number;
  agentName: string;
  action: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

// 3. AI Health Metrics
export interface SystemHealth {
  status: 'Healthy' | 'Degraded' | 'Offline';
  latencyMs: number;
  eventsProcessed: number;
  agentsOnline: number;
  totalAgents: number;
  predictionAccuracy: number;
}
