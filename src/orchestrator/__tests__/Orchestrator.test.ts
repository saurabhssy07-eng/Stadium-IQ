import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Orchestrator } from '../index';
import { stadiumEventBus } from '../../simulation/EventBus';
import { useDashboardStore } from '../../features/dashboard/DashboardStore';
import type { StadiumEvent } from '../../types';

describe('Orchestrator', () => {
  let localOrchestrator: Orchestrator;

  beforeEach(() => {
    stadiumEventBus.clear();
    useDashboardStore.setState({ incidents: [], timelineLogs: [] });
    // Instantiate a fresh orchestrator for each test so it subscribes to the fresh event bus
    localOrchestrator = new Orchestrator();
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

  it('should trigger the agent pipeline and log progress', async () => {
    vi.useFakeTimers();
    
    const testEvent: Omit<StadiumEvent, 'status'> = {
      id: 'test_1',
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
    expect(lastLog.action).toBe('Recommendation Published');
    expect(lastLog.status).toBe('Completed');
    
    vi.useRealTimers();
  });
});
