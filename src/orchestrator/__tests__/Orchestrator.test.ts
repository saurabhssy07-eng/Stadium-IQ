import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { Orchestrator } from '../index';
import { stadiumEventBus } from '../../simulation/EventBus';
import { useDashboardStore } from '../../features/dashboard/DashboardStore';
import type { StadiumEvent } from '../../types';

describe('Orchestrator', () => {
  let localOrchestrator: Orchestrator;

  beforeEach(() => {
    stadiumEventBus.clear();
    useDashboardStore.setState({ incidents: [] });
    // Instantiate a fresh orchestrator for each test so it subscribes to the fresh event bus
    localOrchestrator = new Orchestrator();
    
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process new events and create an incident', () => {
    const testEvent: Omit<StadiumEvent, 'status'> = {
      id: 'test_1',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'MEDICAL',
      priority: 'High',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Heart attack' }
    };

    stadiumEventBus.publish(testEvent);

    const incidents = useDashboardStore.getState().incidents;
    expect(incidents.length).toBe(1);
    expect(incidents[0].type).toBe('MEDICAL');
    expect(incidents[0].severity).toBe('High');
    expect(incidents[0].rawText).toBe('Heart attack');
  });

  it('should trigger the agent pipeline using real API mock', async () => {
    vi.useFakeTimers();
    
    (globalThis.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        severity: 'Critical',
        confidence: 99,
        assignee: 'Special Ops',
        recommendation: 'Send everyone'
      })
    });

    const testEvent: Omit<StadiumEvent, 'status'> = {
      id: 'test_2',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'SECURITY',
      priority: 'Medium',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Lost child' }
    };

    stadiumEventBus.publish(testEvent);

    const logs = localOrchestrator.getLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].agentName).toBe('Ingestion');
    
    await vi.runAllTimersAsync();

    const finalLogs = localOrchestrator.getLogs();
    const lastLog = finalLogs[finalLogs.length - 1];
    
    expect(lastLog.agentName).toBe('Orchestrator');
    expect(lastLog.action).toBe('AI Recommendation Published');
    expect(lastLog.status).toBe('Completed');
    
    const incidents = useDashboardStore.getState().incidents;
    expect(incidents[0].severity).toBe('Critical');
    expect(incidents[0].assignee).toBe('Special Ops');
    expect(incidents[0].reason).toBe('Send everyone');
    expect(incidents[0].confidence).toBe(99);

    vi.useRealTimers();
  });

  it('should fall back to demo mode if API fails', async () => {
    vi.useFakeTimers();
    
    (globalThis.fetch as Mock).mockRejectedValueOnce(new Error('Network Error'));

    const testEvent: Omit<StadiumEvent, 'status'> = {
      id: 'test_3',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'HAZARD',
      priority: 'High',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Fire' }
    };

    stadiumEventBus.publish(testEvent);

    await vi.runAllTimersAsync();
    
    const finalLogs = localOrchestrator.getLogs();
    const lastLog = finalLogs[finalLogs.length - 1];
    
    expect(lastLog.agentName).toBe('Orchestrator');
    expect(lastLog.action).toBe('Demo Recommendation Published');
    expect(lastLog.status).toBe('Completed');
    
    const incidents = useDashboardStore.getState().incidents;
    expect(incidents[0].confidence).toBe(97);

    vi.useRealTimers();
  });
});
