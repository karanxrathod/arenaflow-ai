import { StadiumState, StadiumZone, VendorPrep, Incident, AgentLog, RiskAssessment } from '../types.js';

export type OperationalDomain = 'stadium' | 'campus' | 'hospital';

export interface DomainLabels {
  appName: string;
  subHeader: string;
  location: string;
  event: string;
  tickerDetails: string;
  activeLabel: string;
  zoneTypeLabel: string;
  amenityLabel: string;
  vendorLabel: string;
  drinkLabel: string;
  foodLabel: string;
  extraStaffLabel: string;
}

export const DOMAIN_LABELS: Record<OperationalDomain, DomainLabels> = {
  stadium: {
    appName: 'ArenaFlow AI',
    subHeader: 'Tournament Operations',
    location: 'MetLife Stadium, NYNJ',
    event: 'USA vs Mexico (FIFA World Cup)',
    tickerDetails: "75' Second Half • Live Matchday",
    activeLabel: 'Live Spectator Turnstiles',
    zoneTypeLabel: 'Gate / Corridor',
    amenityLabel: 'Stadium Restroom',
    vendorLabel: 'Concession / Fan Shop',
    drinkLabel: 'Drinks',
    foodLabel: 'Tacos / Food',
    extraStaffLabel: 'Extra Staff'
  },
  campus: {
    appName: 'CampusFlow AI',
    subHeader: 'University Infrastructure & Crowds',
    location: 'Antigravity Tech Institute, CA',
    event: 'Midterm Exams & Student Registration',
    tickerDetails: 'Peak Study Hall & Library Surges',
    activeLabel: 'Main Entrance & Quad Traffic',
    zoneTypeLabel: 'Campus Hall / Zone',
    amenityLabel: 'Campus Restroom',
    vendorLabel: 'Bookstore / Cafeteria',
    drinkLabel: 'Coffee / Drinks',
    foodLabel: 'Paninis / Food',
    extraStaffLabel: 'Support Staff'
  },
  hospital: {
    appName: 'MedFlow AI',
    subHeader: 'Outpatient Triage & Emergency Queues',
    location: 'Metro Wellness Medical Center, NY',
    event: 'Flu Season Intake & Triage Alerts',
    tickerDetails: 'Admissions & Urgent Care Surges',
    activeLabel: 'Intake Desks & Emergency Rooms',
    zoneTypeLabel: 'Clinic Wing / Department',
    amenityLabel: 'Clinical Restroom',
    vendorLabel: 'Dispensary / Pharmacy Desk',
    drinkLabel: 'Rx Prescriptions',
    foodLabel: 'Triage Files',
    extraStaffLabel: 'On-Call Nurse'
  }
};

const CAMPUS_ZONE_NAMES: Record<string, { name: string; location: string }> = {
  'zone-a': { name: 'North Campus Main Entry', location: 'North Archway, Ground Level' },
  'zone-b': { name: 'Student Union Hub', location: 'Main Concourse, Plaza Level' },
  'zone-c': { name: 'University Library Intake', location: 'Science Quad, Level 1' },
  'zone-d': { name: 'Science Lab Annex', location: 'Engineering Block, Floor 2' },
  'zone-e': { name: 'South Bus & Shuttle Stop', location: 'South Perimeter Transit Loop' },
  'zone-f': { name: 'University Bookstore & Coffee', location: 'Student Plaza, Ground Level' },
  'zone-g': { name: 'Central Dining Hall', location: 'North Quad Building, Ground Level' },
  'zone-h': { name: 'Tech & Research Lab', location: 'Innovation Quad, Level 2' },
  'zone-i': { name: 'Student Affairs Registrar', location: 'Admin Building, Level 1 Lobby' },
  'zone-j': { name: 'Admissions Bureau Waiting', location: 'Welcoming Center, Level 1 Lobby' },
  'zone-k': { name: 'Main Campus Assembly Auditorium', location: 'North Hall, Level 3 Concourse' },
  'zone-l': { name: 'Student Recreation Gym & Lockers', location: 'South Complex, Level 2' }
};

const HOSPITAL_ZONE_NAMES: Record<string, { name: string; location: string }> = {
  'zone-a': { name: 'ER Ambulatory & Ambulance Intake', location: 'Emergency Entrance, Ground Level' },
  'zone-b': { name: 'Outpatient Clinic Waiting Wing', location: 'East Wing Concourse, Ground Level' },
  'zone-c': { name: 'Emergency Room Triage Queue', location: 'ER Intake Concourse, Ground Level' },
  'zone-d': { name: 'Diagnostic Labs & X-Ray waiting', location: 'Diagnostics Corridor, Ground Level' },
  'zone-e': { name: 'Main Reception & Intake Lobby', location: 'Central Rotunda, Level 1' },
  'zone-f': { name: 'Central Hospital Pharmacy Dispensary', location: 'West Atrium, Ground Floor' },
  'zone-g': { name: 'Pediatric Urgent Care Clinic', location: 'North Wing Corridor, Ground Floor' },
  'zone-h': { name: 'MRI & Radiology Screening Corridors', location: 'Imaging Center Annex, Level 1' },
  'zone-i': { name: 'Inpatient Admissions & Billing Desks', location: 'Administrative Lobby, Level 2' },
  'zone-j': { name: 'ICU Visitors Control Screening', location: 'Intensive Care Unit Entryway, Level 2' },
  'zone-k': { name: 'Cardiology Consulting Suites', location: 'Specialty Care Wing, Level 3' },
  'zone-l': { name: 'Vaccination Clinic & Express Care', location: 'Wellness Annex, Ground Level' }
};

const CAMPUS_VENDORS: Record<string, string> = {
  'Strikers Tacos & Beers': 'Quad Express Coffee & Paninis',
  'Goalpost Pizza': 'Varsity Pizza Parlor',
  'World Cup Grill': 'Blue Devil Campus Diner',
  'Samba Street Tacos': 'Student Union Taco Truck',
  'The American Gridiron': 'Academic Grillhouse',
  'Empanada Nation': 'Global Flavors Cart',
  'Rio Grande Nachos': 'Student Union Nacho Bar',
  'Hot Dog United': 'Bulldog Campus Dogs',
  'Maple Waffles & Drinks': 'Java Junction Espresso',
  'Pampa Steakhouse Express': 'Pampa Campus Deli',
  'Taco Express West': 'Taco Express Campus',
  'Pretzel Plaza': 'Pretzel Plaza Campus',
  'Balkan Burgers': 'Balkan Burgers Campus',
  'Churrasco Hot Dogs': 'Churrasco Campus Dogs',
  'Sky High Pizza': 'Sky High Pizza Campus',
  'Stadium Fries & Dogs': 'Stadium Fries & Dogs Campus'
};

const HOSPITAL_VENDORS: Record<string, string> = {
  'Strikers Tacos & Beers': 'Prescription Dispensary Counter A',
  'Goalpost Pizza': 'Med-Center Cafe & Salads',
  'World Cup Grill': 'Heart-Healthy Cafeteria',
  'Samba Street Tacos': 'Wellness Express Pharmacy',
  'The American Gridiron': 'Clinical Lab Testing Desk',
  'Empanada Nation': 'Nutritionists Soup Kitchen',
  'Rio Grande Nachos': 'Main Lobby Gift & Flower Shop',
  'Hot Dog United': 'Recovery Room Snack Bar',
  'Maple Waffles & Drinks': 'Emergency Coffee Corner',
  'Pampa Steakhouse Express': 'Pampa Clinic Deli',
  'Taco Express West': 'Taco Express Clinic',
  'Pretzel Plaza': 'Pretzel Plaza Clinic',
  'Balkan Burgers': 'Balkan Burgers Clinic',
  'Churrasco Hot Dogs': 'Churrasco Clinic Dogs',
  'Sky High Pizza': 'Sky High Pizza Clinic',
  'Stadium Fries & Dogs': 'Stadium Fries & Dogs Clinic'
};

export function adaptZone(zone: StadiumZone, domain: OperationalDomain): StadiumZone {
  if (domain === 'stadium') return zone;
  
  const mapping = domain === 'campus' ? CAMPUS_ZONE_NAMES[zone.id] : HOSPITAL_ZONE_NAMES[zone.id];
  const vendorMap = domain === 'campus' ? CAMPUS_VENDORS : HOSPITAL_VENDORS;
  
  const adapted = { ...zone };
  if (mapping) {
    adapted.name = mapping.name;
    adapted.location = mapping.location;
  }
  
  // Adapt amenities names
  if (adapted.amenities) {
    adapted.amenities = {
      toilets: zone.amenities.toilets.map(toilet => ({
        ...toilet,
        name: toilet.name
          .replace('Restroom', domain === 'campus' ? 'Campus Restroom' : 'Clinical Washroom')
          .replace('Concourse Restroom', domain === 'campus' ? 'Concourse Washroom' : 'Clinical Washroom')
      })),
      concessions: zone.amenities.concessions.map(con => ({
        ...con,
        name: vendorMap[con.name] || con.name,
        items: con.items.map(item => {
          if (domain === 'hospital') {
            return item
              .replace('Beer', 'Vitamin Drink')
              .replace('Soda', 'Fresh Juice')
              .replace('Pizza Slice', 'Fresh Salad')
              .replace('Burger', 'Protein Sandwich');
          }
          return item;
        })
      })),
      merch: zone.amenities.merch.map(merch => ({
        ...merch,
        name: merch.name
          .replace('FIFA Fan Shop', domain === 'campus' ? 'Campus Gear Shop' : 'Hospital Gift Store')
          .replace('Mega Store', domain === 'campus' ? 'University Megastore' : 'Hospital Pharmacy')
      }))
    };
  }
  
  return adapted;
}

export function adaptVendorPrep(prep: VendorPrep, domain: OperationalDomain): VendorPrep {
  if (domain === 'stadium') return prep;
  
  const mapping = domain === 'campus' ? CAMPUS_ZONE_NAMES[prep.zoneId] : HOSPITAL_ZONE_NAMES[prep.zoneId];
  const vendorMap = domain === 'campus' ? CAMPUS_VENDORS : HOSPITAL_VENDORS;
  
  return {
    ...prep,
    zoneName: mapping ? mapping.name : prep.zoneName,
    concessionName: vendorMap[prep.concessionName] || prep.concessionName
  };
}

export function adaptIncident(inc: Incident, domain: OperationalDomain): Incident {
  if (domain === 'stadium') return inc;
  
  const mapping = domain === 'campus' ? CAMPUS_ZONE_NAMES[inc.zoneId] : HOSPITAL_ZONE_NAMES[inc.zoneId];
  const adapted = { ...inc };
  if (mapping) {
    adapted.zoneName = mapping.name;
  }
  
  adapted.message = inc.message
    .replace('stadium', domain === 'campus' ? 'campus grounds' : 'medical clinic rooms')
    .replace('stadium-wide', domain === 'campus' ? 'campus-wide' : 'hospital-wide')
    .replace('metal detectors', domain === 'campus' ? 'ID readers' : 'intake scanners')
    .replace('spectators', domain === 'campus' ? 'students' : 'patients')
    .replace('Turnstile Line C', domain === 'campus' ? 'Library Entry' : 'ER Triage Queue')
    .replace('Gate G', domain === 'campus' ? 'Dining Commons' : 'Pediatric Urgent Care')
    .replace('Gates F and H', domain === 'campus' ? 'Bookstore and Tech Annex' : 'Pharmacy and Radiology')
    .replace('Gates', domain === 'campus' ? 'Halls' : 'Clinic Wings')
    .replace('Gate', domain === 'campus' ? 'Hall' : 'Clinic Wing')
    .replace('Turnstile', domain === 'campus' ? 'Access Gate' : 'Intake Desk');
    
  if (adapted.mitigationPlan) {
    adapted.mitigationPlan = adapted.mitigationPlan
      .replace('stadium', domain === 'campus' ? 'campus' : 'hospital')
      .replace('spectators', domain === 'campus' ? 'students' : 'patients')
      .replace('entries', domain === 'campus' ? 'access doors' : 'clinics')
      .replace('Gates', domain === 'campus' ? 'Halls' : 'Wings');
  }
  
  return adapted;
}

export function adaptAgentLog(log: AgentLog, domain: OperationalDomain): AgentLog {
  if (domain === 'stadium') return log;
  
  const adapted = { ...log };
  adapted.message = log.message
    .replace('stadium', domain === 'campus' ? 'campus' : 'hospital')
    .replace('stadium twin', domain === 'campus' ? 'campus digital twin' : 'hospital digital twin')
    .replace('turnstile', domain === 'campus' ? 'entryway' : 'clinic intake desk')
    .replace('turnstiles', domain === 'campus' ? 'entryways' : 'intake desks')
    .replace('Gate G', domain === 'campus' ? 'Dining Commons' : 'Pediatric Urgent Care')
    .replace('Gates F and H', domain === 'campus' ? 'Bookstore and Tech Annex' : 'Pharmacy and Radiology')
    .replace('Gates', domain === 'campus' ? 'Halls' : 'Clinic Wings')
    .replace('Gate', domain === 'campus' ? 'Hall' : 'Clinic Wing')
    .replace('FIFA World Cup 2026', domain === 'campus' ? 'Antigravity Tech Campus' : 'Metro Wellness Center');
    
  return adapted;
}

export function adaptStadiumState(state: StadiumState, domain: OperationalDomain): StadiumState {
  if (domain === 'stadium') return state;
  
  return {
    ...state,
    zones: state.zones.map(z => adaptZone(z, domain)),
    incidents: state.incidents.map(inc => adaptIncident(inc, domain)),
    vendorPreps: state.vendorPreps.map(prep => adaptVendorPrep(prep, domain)),
    agentLogs: state.agentLogs.map(log => adaptAgentLog(log, domain)),
    weather: {
      ...state.weather,
      condition: state.weather.condition.replace('World Cup', domain === 'campus' ? 'Exam Week' : 'Clinic Intake')
    },
    transit: {
      ...state.transit,
      subwayStatus: state.transit.subwayStatus.replace('Stadium', domain === 'campus' ? 'Campus Shuttle' : 'Emergency Lane'),
      shuttleStatus: state.transit.shuttleStatus.replace('Lot C', domain === 'campus' ? 'Library Quad' : 'ER Ambulance Bay'),
      parkingStatus: state.transit.parkingStatus.replace('Lots', domain === 'campus' ? 'Student Lots' : 'Patient Garages')
    }
  };
}

export function adaptRiskAssessment(risk: RiskAssessment | null, domain: OperationalDomain): RiskAssessment | null {
  if (!risk || domain === 'stadium') return risk;
  
  const textReplace = (text: string) => {
    return text
      .replace(/stadium/gi, domain === 'campus' ? 'campus' : 'hospital')
      .replace(/matchday/gi, domain === 'campus' ? 'exam period' : 'admissions cycle')
      .replace(/spectators/gi, domain === 'campus' ? 'students' : 'patients')
      .replace(/gates/gi, domain === 'campus' ? 'halls' : 'clinic wings')
      .replace(/gate/gi, domain === 'campus' ? 'hall' : 'clinic wing')
      .replace(/fans/gi, domain === 'campus' ? 'students' : 'patients')
      .replace(/fan/gi, domain === 'campus' ? 'student' : 'patient')
      .replace(/turnstile/gi, domain === 'campus' ? 'entry check' : 'intake desk')
      .replace(/concessions/gi, domain === 'campus' ? 'cafeterias' : 'dispensaries')
      .replace(/concession/gi, domain === 'campus' ? 'cafeteria' : 'dispensary');
  };

  return {
    ...risk,
    summary: textReplace(risk.summary),
    weatherImpact: textReplace(risk.weatherImpact),
    transitImpact: textReplace(risk.transitImpact),
    recommendations: risk.recommendations.map((r: string) => textReplace(r))
  };
}
