interface SimulationConfig {
  updateInterval: number; // ms
  densityVariation: number; // ± percentage
  zoneCount: number;
}

export class SimulationEngine {
  private interval: any = null;
  private config: SimulationConfig;

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.generateSimulatedData();
    }, this.config.updateInterval);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private async generateSimulatedData() {
    // 12 zones defined in our system
    const zones = [
      'zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e', 'zone-f',
      'zone-g', 'zone-h', 'zone-i', 'zone-j', 'zone-k', 'zone-l'
    ];
    
    // Pick 1 to 2 random zones to vary in this step
    const numberOfZonesToUpdate = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < numberOfZonesToUpdate; i++) {
      const randomZoneId = zones[Math.floor(Math.random() * zones.length)];
      
      try {
        const res = await fetch('/api/stadium-state');
        if (res.ok) {
          const state = await res.json();
          const zone = state.zones.find((z: any) => z.id === randomZoneId);
          if (zone) {
            // Vary the density slightly (-densityVariation to +densityVariation)
            const change = Math.floor(Math.random() * (this.config.densityVariation * 2 + 1)) - this.config.densityVariation;
            let newDensity = zone.density + change;
            
            // Keep density within realistic operational bounds (10% to 92%)
            newDensity = Math.max(10, Math.min(92, newDensity));
            
            // Post update to the backend API which handles multi-agent check automatically
            await fetch('/api/update-density', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ zoneId: randomZoneId, density: newDensity }),
            });
          }
        }
      } catch (err) {
        console.error('SimulationEngine update error:', err);
      }
    }
  }
}
