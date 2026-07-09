import { stadiumEventBus } from './EventBus';
import type { StadiumState, Fan } from '../types';
import { useDashboardStore } from '../features/dashboard/DashboardStore';

export class DigitalTwin {
  private state: StadiumState;
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private tickRateMs = 3000; // Fast for demo purposes

  constructor() {
    this.state = {
      timestamp: Date.now(),
      fans: this.generateInitialFans(200), // Start with 200 fans for UI performance
      activeIncidents: [],
      zones: {
        'Gate A': { currentCapacity: 120, maxCapacity: 500, riskScore: 24, status: 'normal' },
        'Gate B': { currentCapacity: 450, maxCapacity: 500, riskScore: 90, status: 'critical' },
        'Gate C': { currentCapacity: 50, maxCapacity: 500, riskScore: 10, status: 'normal' },
        'Food Court': { currentCapacity: 300, maxCapacity: 500, riskScore: 60, status: 'moderate' }
      }
    };
  }

  private generateInitialFans(count: number): Fan[] {
    const fans: Fan[] = [];
    for (let i = 0; i < count; i++) {
      fans.push({
        id: `fan_${i}`,
        location: { x: Math.random() * 100, y: Math.random() * 100, zoneId: 'Concourse' },
        isMoving: Math.random() > 0.3, // 70% of fans are moving
        language: Math.random() > 0.7 ? 'es' : 'en'
      });
    }
    return fans;
  }

  public startSimulation() {
    if (this.simulationInterval) return;

    this.simulationInterval = setInterval(() => {
      this.tick();
    }, this.tickRateMs);
    
    console.log("Digital Stadium Twin Engine Started.");
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  private tick() {
    this.state.timestamp = Date.now();
    
    // Simulate crowd movement for the heatmap
    this.state.fans.forEach(fan => {
      if (fan.isMoving) {
        fan.location.x += (Math.random() - 0.5) * 4;
        fan.location.y += (Math.random() - 0.5) * 4;
        
        // Keep within bounds
        fan.location.x = Math.max(0, Math.min(100, fan.location.x));
        fan.location.y = Math.max(0, Math.min(100, fan.location.y));
      }
    });

    // Simulate Heatmap "Breathing" (Fluctuating Risk Scores)
    Object.keys(this.state.zones).forEach(zoneId => {
      const zone = this.state.zones[zoneId];
      // Random walk for risk score
      zone.riskScore = Math.max(0, Math.min(100, zone.riskScore + (Math.random() - 0.5) * 6));
      
      // Derive status from risk score
      if (zone.riskScore >= 80) zone.status = 'critical';
      else if (zone.riskScore >= 60) zone.status = 'heavy';
      else if (zone.riskScore >= 40) zone.status = 'moderate';
      else zone.status = 'normal';
    });

    // Generate random background noise events to populate the Orchestrator
    if (Math.random() > 0.85) { // 15% chance per tick
      stadiumEventBus.publish({
        id: `iot_${Date.now()}`,
        timestamp: Date.now(),
        source: 'IOT_SENSOR',
        type: 'DENSITY_SPIKE',
        priority: 'Low',
        location: { x: 30, y: 70, zoneId: 'Concourse B' },
        payload: { message: 'Minor congestion detected near food vendor.' }
      });
    }

    // Push the raw twin state directly to the dashboard store
    useDashboardStore.getState().updateStadiumState([...this.state.fans], { ...this.state.zones });
  }

  public getState(): StadiumState {
    return this.state;
  }
}

// Global Singleton Instance
export const stadiumTwin = new DigitalTwin();
