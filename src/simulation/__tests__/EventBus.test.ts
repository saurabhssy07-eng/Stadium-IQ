import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stadiumEventBus } from '../EventBus';
import type { StadiumEvent } from '../../types';

describe('EventBus', () => {
  beforeEach(() => {
    stadiumEventBus.clear();
  });

  it('should allow subscribers to receive published events', () => {
    const mockListener = vi.fn();
    stadiumEventBus.subscribe(mockListener);

    const testEvent: Omit<StadiumEvent, 'status'> = {
      id: 'test_1',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'MEDICAL',
      priority: 'High',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Test message' }
    };

    stadiumEventBus.publish(testEvent);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({
      ...testEvent,
      status: 'New'
    }));
  });

  it('should maintain a history of all published events', () => {
    stadiumEventBus.publish({
      id: 'test_1',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'MEDICAL',
      priority: 'High',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Test message 1' }
    });

    stadiumEventBus.publish({
      id: 'test_2',
      timestamp: Date.now(),
      source: 'FAN_APP',
      type: 'SECURITY',
      priority: 'Medium',
      location: { x: 30, y: 40, zoneId: 'Zone B' },
      payload: { message: 'Test message 2' }
    });

    const history = stadiumEventBus.getHistory();
    expect(history.length).toBe(2);
    expect(history[0].id).toBe('test_1');
    expect(history[1].id).toBe('test_2');
  });

  it('should allow subscribers to unsubscribe', () => {
    const mockListener = vi.fn();
    const unsubscribe = stadiumEventBus.subscribe(mockListener);

    unsubscribe();

    stadiumEventBus.publish({
      id: 'test_1',
      timestamp: Date.now(),
      source: 'IOT_SENSOR',
      type: 'MEDICAL',
      priority: 'High',
      location: { x: 10, y: 20, zoneId: 'Zone A' },
      payload: { message: 'Test message 1' }
    });

    expect(mockListener).not.toHaveBeenCalled();
  });
});
