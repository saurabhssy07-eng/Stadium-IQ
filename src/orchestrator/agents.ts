import type { StadiumEvent } from '../types';

export const IncidentAgent = {
  determineSeverity: (event: StadiumEvent): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (event.type === 'MEDICAL') return 'Critical';
    if (event.type === 'HAZARD') return 'High';
    if (event.type === 'SECURITY') return 'High';
    return event.priority || 'Medium';
  },
  generateAction: (type: string, location: string): string => {
    if (type === 'HAZARD') return `Dispatch Maintenance to ${location} and isolate area`;
    if (type === 'MEDICAL') return `Dispatch Medics to ${location} immediately`;
    if (type === 'SECURITY') return `Dispatch Security Team Alpha to ${location}`;
    return `Dispatch Staff to ${location}`;
  }
};

export const CrowdAgent = {
  calculateDensityRisk: (currentCapacity: number, maxCapacity: number): { riskScore: number, status: 'normal' | 'moderate' | 'heavy' | 'critical' } => {
    const density = (currentCapacity / maxCapacity) * 100;
    
    if (density >= 80) return { riskScore: density, status: 'critical' };
    if (density >= 60) return { riskScore: density, status: 'heavy' };
    if (density >= 30) return { riskScore: density, status: 'moderate' };
    return { riskScore: density, status: 'normal' };
  }
};
