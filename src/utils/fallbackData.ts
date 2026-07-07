import { StadiumState, StadiumZone, VendorPrep } from '../types.js';

export const INITIAL_ZONES: StadiumZone[] = [
  {
    id: 'zone-a',
    name: 'Gate A (North Entry)',
    location: 'North Perimeter, Ground Floor',
    density: 42,
    capacity: 8000,
    currentCount: 3360,
    status: 'MEDIUM',
    queueTimeMin: 12,
    amenities: {
      toilets: [
        { id: 'toilet-n1', name: 'North Restroom 101', waitTimeMin: 4, distanceM: 45 },
        { id: 'toilet-n2', name: 'North Restroom 102 (ADA)', waitTimeMin: 2, distanceM: 90 }
      ],
      concessions: [
        { id: 'concess-n1', name: 'Strikers Tacos & Beers', waitTimeMin: 8, items: ['Tacos', 'Beer', 'Pretzel'], distanceM: 30 },
        { id: 'concess-n2', name: 'Goalpost Pizza', waitTimeMin: 15, items: ['Pizza Slice', 'Soda', 'Hotdog'], distanceM: 70 }
      ],
      merch: [
        { id: 'merch-n1', name: 'FIFA Fan Shop North', waitTimeMin: 10, distanceM: 50 }
      ]
    }
  },
  {
    id: 'zone-b',
    name: 'Gate B (North-East Entry)',
    location: 'North-East Perimeter, Ground Floor',
    density: 28,
    capacity: 6000,
    currentCount: 1680,
    status: 'LOW',
    queueTimeMin: 5,
    amenities: {
      toilets: [
        { id: 'toilet-ne1', name: 'NE Restroom 105', waitTimeMin: 1, distanceM: 60 }
      ],
      concessions: [
        { id: 'concess-ne1', name: 'World Cup Grill', waitTimeMin: 5, items: ['Burger', 'Fries', 'Soda'], distanceM: 40 }
      ],
      merch: []
    }
  },
  {
    id: 'zone-c',
    name: 'Gate C (East Entry)',
    location: 'East Perimeter, Ground Floor',
    density: 68,
    capacity: 9000,
    currentCount: 6120,
    status: 'HIGH',
    queueTimeMin: 25,
    amenities: {
      toilets: [
        { id: 'toilet-e1', name: 'East Concourse Restroom A', waitTimeMin: 14, distanceM: 35 },
        { id: 'toilet-e2', name: 'East Concourse Restroom B', waitTimeMin: 18, distanceM: 110 }
      ],
      concessions: [
        { id: 'concess-e1', name: 'Samba Street Tacos', waitTimeMin: 22, items: ['Tacos', 'Churros', 'Margarita'], distanceM: 25 },
        { id: 'concess-e2', name: 'The American Gridiron', waitTimeMin: 19, items: ['Burger', 'Beer', 'Pretzel'], distanceM: 80 }
      ],
      merch: [
        { id: 'merch-e1', name: 'Mega Store East', waitTimeMin: 20, distanceM: 60 }
      ]
    }
  },
  {
    id: 'zone-d',
    name: 'Gate D (South-East Entry)',
    location: 'South-East Perimeter, Ground Floor',
    density: 35,
    capacity: 6500,
    currentCount: 2275,
    status: 'MEDIUM',
    queueTimeMin: 10,
    amenities: {
      toilets: [
        { id: 'toilet-se1', name: 'SE Restroom 112', waitTimeMin: 3, distanceM: 55 }
      ],
      concessions: [
        { id: 'concess-se1', name: 'Empanada Nation', waitTimeMin: 7, items: ['Empanadas', 'Soda'], distanceM: 35 }
      ],
      merch: []
    }
  },
  {
    id: 'zone-e',
    name: 'Gate E (South Entry)',
    location: 'South Perimeter, Ground Floor',
    density: 52,
    capacity: 8000,
    currentCount: 4160,
    status: 'MEDIUM',
    queueTimeMin: 15,
    amenities: {
      toilets: [
        { id: 'toilet-s1', name: 'South Restroom 118', waitTimeMin: 8, distanceM: 50 },
        { id: 'toilet-s2', name: 'South Restroom 119 (ADA)', waitTimeMin: 5, distanceM: 75 }
      ],
      concessions: [
        { id: 'concess-s1', name: 'Rio Grande Nachos', waitTimeMin: 12, items: ['Nachos', 'Beer', 'Soda'], distanceM: 45 },
        { id: 'concess-s2', name: 'Hot Dog United', waitTimeMin: 10, items: ['Hotdog', 'Pretzel', 'Water'], distanceM: 60 }
      ],
      merch: [
        { id: 'merch-s1', name: 'FIFA Fan Shop South', waitTimeMin: 12, distanceM: 55 }
      ]
    }
  },
  {
    id: 'zone-f',
    name: 'Gate F (South-West Entry)',
    location: 'South-West Perimeter, Ground Floor',
    density: 18,
    capacity: 6000,
    currentCount: 1080,
    status: 'LOW',
    queueTimeMin: 3,
    amenities: {
      toilets: [
        { id: 'toilet-sw1', name: 'SW Restroom 122', waitTimeMin: 1, distanceM: 65 }
      ],
      concessions: [
        { id: 'concess-sw1', name: 'Maple Waffles & Drinks', waitTimeMin: 4, items: ['Waffles', 'Coffee', 'Soda'], distanceM: 50 }
      ],
      merch: []
    }
  },
  {
    id: 'zone-g',
    name: 'Gate G (West Entry)',
    location: 'West Perimeter, Ground Floor',
    density: 76,
    capacity: 9000,
    currentCount: 6840,
    status: 'CRITICAL',
    queueTimeMin: 32,
    amenities: {
      toilets: [
        { id: 'toilet-w1', name: 'West Restroom A', waitTimeMin: 22, distanceM: 40 },
        { id: 'toilet-w2', name: 'West Restroom B', waitTimeMin: 15, distanceM: 120 }
      ],
      concessions: [
        { id: 'concess-w1', name: 'Pampa Steakhouse Express', waitTimeMin: 28, items: ['Steak Sandwich', 'Beer'], distanceM: 30 },
        { id: 'concess-w2', name: 'Taco Express West', waitTimeMin: 24, items: ['Tacos', 'Soda'], distanceM: 75 }
      ],
      merch: [
        { id: 'merch-w1', name: 'Mega Store West', waitTimeMin: 25, distanceM: 50 }
      ]
    }
  },
  {
    id: 'zone-h',
    name: 'Gate H (North-West Entry)',
    location: 'North-West Perimeter, Ground Floor',
    density: 30,
    capacity: 6500,
    currentCount: 1950,
    status: 'LOW',
    queueTimeMin: 6,
    amenities: {
      toilets: [
        { id: 'toilet-nw1', name: 'NW Restroom 130', waitTimeMin: 2, distanceM: 50 }
      ],
      concessions: [
        { id: 'concess-nw1', name: 'Pretzel Plaza', waitTimeMin: 5, items: ['Pretzel', 'Water', 'Beer'], distanceM: 35 }
      ],
      merch: []
    }
  },
  {
    id: 'zone-i',
    name: 'Lower Tier North Concourse',
    location: 'North End, Level 1',
    density: 48,
    capacity: 12000,
    currentCount: 5760,
    status: 'MEDIUM',
    queueTimeMin: 14,
    amenities: {
      toilets: [
        { id: 'toilet-ltn1', name: 'LT Restroom 142', waitTimeMin: 7, distanceM: 50 }
      ],
      concessions: [
        { id: 'concess-ltn1', name: 'Balkan Burgers', waitTimeMin: 13, items: ['Burger', 'Fries', 'Soda'], distanceM: 40 }
      ],
      merch: [
        { id: 'merch-ltn1', name: 'Fan Shop LT North', waitTimeMin: 11, distanceM: 80 }
      ]
    }
  },
  {
    id: 'zone-j',
    name: 'Lower Tier South Concourse',
    location: 'South End, Level 1',
    density: 50,
    capacity: 12000,
    currentCount: 6000,
    status: 'MEDIUM',
    queueTimeMin: 16,
    amenities: {
      toilets: [
        { id: 'toilet-lts1', name: 'LT Restroom 155', waitTimeMin: 9, distanceM: 45 }
      ],
      concessions: [
        { id: 'concess-lts1', name: 'Churrasco Hot Dogs', waitTimeMin: 11, items: ['Hotdog', 'Beer', 'Soda'], distanceM: 30 }
      ],
      merch: []
    }
  },
  {
    id: 'zone-k',
    name: 'Upper Tier East Concourse',
    location: 'East End, Level 3',
    density: 58,
    capacity: 15000,
    currentCount: 8700,
    status: 'HIGH',
    queueTimeMin: 20,
    amenities: {
      toilets: [
        { id: 'toilet-ute1', name: 'UT Restroom 301', waitTimeMin: 12, distanceM: 70 },
        { id: 'toilet-ute2', name: 'UT Restroom 302', waitTimeMin: 14, distanceM: 100 }
      ],
      concessions: [
        { id: 'concess-ute1', name: 'Sky High Pizza', waitTimeMin: 17, items: ['Pizza Slice', 'Soda'], distanceM: 40 }
      ],
      merch: [
        { id: 'merch-ute1', name: 'FIFA Merch Cart K', waitTimeMin: 8, distanceM: 60 }
      ]
    }
  },
  {
    id: 'zone-l',
    name: 'Upper Tier West Concourse',
    location: 'West End, Level 3',
    density: 38,
    capacity: 15000,
    currentCount: 5700,
    status: 'MEDIUM',
    queueTimeMin: 11,
    amenities: {
      toilets: [
        { id: 'toilet-utw1', name: 'UT Restroom 315', waitTimeMin: 5, distanceM: 60 }
      ],
      concessions: [
        { id: 'concess-utw1', name: 'Stadium Fries & Dogs', waitTimeMin: 9, items: ['Hotdog', 'Fries', 'Water'], distanceM: 50 }
      ],
      merch: []
    }
  }
];

export const getFallbackStadiumState = (): StadiumState => {
  const state: StadiumState = {
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    weather: {
      temp: '27°C (81°F)',
      condition: 'Partly Cloudy, Humidity 62%',
      wind: '12 km/h NE'
    },
    transit: {
      subwayStatus: 'Running - High Frequency (2 min intervals)',
      shuttleStatus: 'Heavy traffic near parking Lot C',
      parkingStatus: 'Lots A, B, E full. Lot D at 80% capacity',
      loadLevel: 'Heavy'
    },
    incidents: [
      {
        id: 'inc-1',
        timestamp: new Date().toLocaleTimeString(),
        zoneId: 'zone-g',
        zoneName: 'Gate G (West Entry)',
        severity: 'CRITICAL',
        message: 'Crowd density exceeded critical threshold (76%). Heavy friction at metal detectors.',
        status: 'INVESTIGATING',
        agentOwner: 'Supervisor Agent',
        mitigationPlan: 'Autonomous rerouting plan dispatched to Gates F and H. Signage updated.'
      }
    ],
    vendorPreps: [],
    agentLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toLocaleTimeString(),
        agentName: 'Supervisor Agent',
        message: 'System started (Local Fallback Twin). Initialized stadium twin for FIFA World Cup 2026. Monitoring all 12 operational zones.',
        status: 'COMPLETED'
      }
    ]
  };

  state.vendorPreps = generateVendorPrepsForZones(state.zones);
  return state;
};

export const generateVendorPrepsForZones = (zones: StadiumZone[]): VendorPrep[] => {
  return zones.map(zone => {
    const isSurging = zone.density >= 70;
    const isHigh = zone.density >= 55 && zone.density < 70;
    const isModerate = zone.density >= 35 && zone.density < 55;

    let predictedDemand: 'LOW' | 'MODERATE' | 'HIGH' | 'SURGING' = 'LOW';
    let multiplier = 0.5;

    if (isSurging) {
      predictedDemand = 'SURGING';
      multiplier = 2.5;
    } else if (isHigh) {
      predictedDemand = 'HIGH';
      multiplier = 1.8;
    } else if (isModerate) {
      predictedDemand = 'MODERATE';
      multiplier = 1.2;
    }

    const concession = zone.amenities.concessions[0] || { name: 'Main Concourse Snack Stand' };

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      currentDensity: zone.density,
      concessionName: concession.name,
      predictedDemand,
      refreshmentsToPrep: Math.round(zone.capacity * 0.05 * multiplier),
      tacosToPrep: Math.round(zone.capacity * 0.03 * multiplier),
      additionalStaffRecommended: isSurging ? 4 : (isHigh ? 2 : 0),
      alertSent: zone.density >= 55
    };
  });
};

export function getStatusFromDensity(density: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (density < 35) return 'LOW';
  if (density < 55) return 'MEDIUM';
  if (density < 75) return 'HIGH';
  return 'CRITICAL';
}
