export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StadiumZone {
  id: string;
  name: string;
  location: string;
  density: number; // percentage (0-100)
  capacity: number; // max people
  currentCount: number; // current count of people
  status: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  queueTimeMin: number; // average queue time in minutes for gates/amenities
  amenities: {
    toilets: { id: string; name: string; waitTimeMin: number; distanceM: number }[];
    concessions: { id: string; name: string; waitTimeMin: number; items: string[]; distanceM: number }[];
    merch: { id: string; name: string; waitTimeMin: number; distanceM: number }[];
  };
}

export interface RiskAssessment {
  score: number; // 0-100
  level: RiskLevel;
  summary: string;
  weatherImpact: string;
  transitImpact: string;
  recommendations: string[];
}

export interface Incident {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVING' | 'RESOLVED';
  agentOwner?: string;
  mitigationPlan?: string;
}

export interface VendorPrep {
  zoneId: string;
  zoneName: string;
  currentDensity: number;
  concessionName: string;
  predictedDemand: 'LOW' | 'MODERATE' | 'HIGH' | 'SURGING';
  refreshmentsToPrep: number;
  tacosToPrep: number;
  additionalStaffRecommended: number;
  alertSent: boolean;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agentName: 'Supervisor Agent' | 'Analysis Agent' | 'Mitigation Agent';
  message: string;
  status: 'IDLE' | 'PROCESSING' | 'COMPLETED' | 'ALERT';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  language?: string;
}

export interface StadiumState {
  zones: StadiumZone[];
  weather: {
    temp: string;
    condition: string;
    wind: string;
  };
  transit: {
    subwayStatus: string;
    shuttleStatus: string;
    parkingStatus: string;
    loadLevel: 'Normal' | 'Heavy' | 'Extreme';
  };
  incidents: Incident[];
  vendorPreps: VendorPrep[];
  agentLogs: AgentLog[];
}
