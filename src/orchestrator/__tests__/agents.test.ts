import { describe, it, expect } from 'vitest';
import { IncidentAgent, CrowdAgent } from '../agents';
import type { StadiumEvent } from '../../types';

describe('IncidentAgent', () => {
  describe('Severity Matrix', () => {
    it('assigns Critical severity to Medical emergencies', () => {
      const event = { type: 'MEDICAL' } as StadiumEvent;
      expect(IncidentAgent.determineSeverity(event)).toBe('Critical');
    });

    it('assigns High severity to Spills/Hazards', () => {
      const event = { type: 'HAZARD' } as StadiumEvent;
      expect(IncidentAgent.determineSeverity(event)).toBe('High');
    });

    it('assigns High severity to Security concerns', () => {
      const event = { type: 'SECURITY' } as StadiumEvent;
      expect(IncidentAgent.determineSeverity(event)).toBe('High');
    });

    it('falls back to the event priority for unknown types', () => {
      const event = { type: 'MAINTENANCE', priority: 'Medium' } as StadiumEvent;
      expect(IncidentAgent.determineSeverity(event)).toBe('Medium');
    });
  });

  describe('Action Generation', () => {
    it('generates correct action for Medical incidents', () => {
      expect(IncidentAgent.generateAction('MEDICAL', 'Gate A')).toContain('Medics');
    });
  });
});

describe('CrowdAgent', () => {
  describe('Density Risk Calculation', () => {
    it('returns Normal status for density < 30%', () => {
      const result = CrowdAgent.calculateDensityRisk(20, 100);
      expect(result.status).toBe('normal');
      expect(result.riskScore).toBe(20);
    });

    it('returns Moderate status for density 30-59%', () => {
      const result = CrowdAgent.calculateDensityRisk(45, 100);
      expect(result.status).toBe('moderate');
    });

    it('returns Heavy status for density 60-79%', () => {
      const result = CrowdAgent.calculateDensityRisk(75, 100);
      expect(result.status).toBe('heavy');
    });

    it('returns Critical status for density >= 80%', () => {
      const result = CrowdAgent.calculateDensityRisk(85, 100);
      expect(result.status).toBe('critical');
    });
  });
});
