import { describe, test, expect } from 'vitest';
import { sanitizeInput, validateEmail, validateZoneId, validateLanguage } from '../utils/validators.js';
import { sanitizeString, getSecureErrorMessage, corsMiddleware, setSecurityHeaders, jsonErrorHandler } from '../../server/security.js';
import { getFallbackStadiumState, generateVendorPrepsForZones, getStatusFromDensity } from '../utils/fallbackData.js';
import { adaptZone, adaptIncident, adaptRiskAssessment, DOMAIN_LABELS } from '../utils/domainAdapter.js';

describe('1. Frontend Input Sanitization & Input Checks', () => {
  test('sanitizeInput strips HTML brackets and crops length', () => {
    const rawXSS = '<script>alert("XSS")</script>';
    const cleaned = sanitizeInput(rawXSS);
    expect(cleaned).not.toContain('<');
    expect(cleaned).not.toContain('>');
    expect(cleaned).toBe('scriptalert("XSS")/script');

    const longStr = 'a'.repeat(2000);
    expect(sanitizeInput(longStr).length).toBe(1000);
  });

  test('validateEmail conforms to RFC 5322 standards', () => {
    expect(validateEmail('ops.lead@fifa2026.org')).toBe(true);
    expect(validateEmail('user.name+label@sub.domain.co')).toBe(true);
    expect(validateEmail('plainaddress')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('joe@domain.')).toBe(false);
  });

  test('validateZoneId filters correctly', () => {
    expect(validateZoneId('zone-a')).toBe(true);
    expect(validateZoneId('ZONE-L')).toBe(true);
    expect(validateZoneId('zone-z')).toBe(false);
    expect(validateZoneId('invalid-zone-id')).toBe(false);
  });

  test('validateLanguage matches system support', () => {
    expect(validateLanguage('en')).toBe(true);
    expect(validateLanguage('es')).toBe(true);
    expect(validateLanguage('JA')).toBe(false);
  });
});

describe('2. Backend Security & Sanitization Engines', () => {
  test('sanitizeString converts HTML characters to safe entities', () => {
    const rawStr = 'Hello <World> & "Friends"';
    const escaped = sanitizeString(rawStr, 100);
    expect(escaped).toBe('Hello &lt;World&gt; &amp; &quot;Friends&quot;');

    const veryLongStr = 'x'.repeat(200);
    expect(sanitizeString(veryLongStr, 15).length).toBe(15);
  });

  test('getSecureErrorMessage strips details in production', () => {
    const rawError = new Error('Database password was: secret123 at line 42 of index.ts');
    
    // In production mode, expect details to be stripped
    const savedEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const prodMessage = getSecureErrorMessage(rawError, 'Generic fallback');
    expect(prodMessage).toBe('Generic fallback');
    expect(prodMessage).not.toContain('secret123');
    expect(prodMessage).not.toContain('line 42');

    // In development mode, details are visible
    process.env.NODE_ENV = 'development';
    const devMessage = getSecureErrorMessage(rawError, 'Generic fallback');
    expect(devMessage).toBe('Database password was: secret123 at line 42 of index.ts');

    // Restore env
    process.env.NODE_ENV = savedEnv;
  });
});

describe('3. Fallback Data & Stadium Twin calculations', () => {
  test('getStatusFromDensity returns correct status thresholds', () => {
    expect(getStatusFromDensity(10)).toBe('LOW');
    expect(getStatusFromDensity(34)).toBe('LOW');
    expect(getStatusFromDensity(35)).toBe('MEDIUM');
    expect(getStatusFromDensity(54)).toBe('MEDIUM');
    expect(getStatusFromDensity(55)).toBe('HIGH');
    expect(getStatusFromDensity(74)).toBe('HIGH');
    expect(getStatusFromDensity(75)).toBe('CRITICAL');
    expect(getStatusFromDensity(99)).toBe('CRITICAL');
  });

  test('generateVendorPrepsForZones calculates prep volume based on density', () => {
    const mockZones = [
      {
        id: 'zone-a',
        name: 'Zone A',
        location: 'North',
        density: 20, // Low demand
        capacity: 1000,
        currentCount: 200,
        status: 'LOW' as const,
        queueTimeMin: 5,
        amenities: { toilets: [], concessions: [{ id: 'c-1', name: 'Hotdogs', waitTimeMin: 2, items: [], distanceM: 10 }], merch: [] }
      },
      {
        id: 'zone-b',
        name: 'Zone B',
        location: 'South',
        density: 80, // Surging demand
        capacity: 1000,
        currentCount: 800,
        status: 'CRITICAL' as const,
        queueTimeMin: 30,
        amenities: { toilets: [], concessions: [{ id: 'c-2', name: 'Burgers', waitTimeMin: 15, items: [], distanceM: 20 }], merch: [] }
      }
    ];

    const preps = generateVendorPrepsForZones(mockZones);
    expect(preps).toHaveLength(2);
    expect(preps[0].predictedDemand).toBe('LOW');
    expect(preps[1].predictedDemand).toBe('SURGING');
    expect(preps[1].additionalStaffRecommended).toBe(4);
    expect(preps[1].alertSent).toBe(true);
  });

  test('getFallbackStadiumState builds correct initial structures', () => {
    const fallback = getFallbackStadiumState();
    expect(fallback.zones.length).toBe(12);
    expect(fallback.weather.temp).toContain('27°C');
    expect(fallback.incidents.length).toBeGreaterThan(0);
    expect(fallback.vendorPreps.length).toBe(12);
  });
});

describe('4. Server Security Middlewares & Controllers', () => {
  test('corsMiddleware enforces allowed origins securely', () => {
    let headers: Record<string, string> = {};
    const mockReq = {
      headers: { origin: 'https://arenaflow-ai.vercel.app' }
    } as any;
    const mockRes = {
      setHeader: (key: string, val: string) => { headers[key] = val; },
      sendStatus: () => {}
    } as any;
    const next = () => {};

    corsMiddleware(mockReq, mockRes, next);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://arenaflow-ai.vercel.app');

    // Test unauthorized origin fallback
    const mockReqBad = {
      headers: { origin: 'https://unauthorized-attacker.com' }
    } as any;
    corsMiddleware(mockReqBad, mockRes, next);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://arenaflow-ai.vercel.app');
  });

  test('setSecurityHeaders assigns all required security profiles', () => {
    let headers: Record<string, string> = {};
    const mockReq = {} as any;
    const mockRes = {
      setHeader: (key: string, val: string) => { headers[key] = val; }
    } as any;
    const next = () => {};

    setSecurityHeaders(mockReq, mockRes, next);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
  });

  test('jsonErrorHandler handles JSON SyntaxErrors elegantly', () => {
    let statusSet: number = 0;
    let responseJson: any = null;
    let nextCalled = false;

    const mockErr = new SyntaxError('Unexpected token } in JSON');
    (mockErr as any).status = 400;
    (mockErr as any).body = '{';

    const mockReq = {} as any;
    const mockRes = {
      status: (code: number) => { statusSet = code; return mockRes; },
      json: (data: any) => { responseJson = data; }
    } as any;
    const next = () => { nextCalled = true; };

    jsonErrorHandler(mockErr, mockReq, mockRes, next);
    expect(statusSet).toBe(400);
    expect(responseJson.error).toContain('Malformed JSON payload');
    expect(nextCalled).toBe(false);
  });
});

describe('5. Real-Time Server State Mutation Engine', () => {
  // We can dynamically import the state functions to isolate their tests safely
  test('Server state handlers update state dynamically', async () => {
    const { getStadiumState, updateZoneDensity, resetStadiumState, addIncident } = await import('../../server/state.js');
    
    // Test base retrieve
    const startState = getStadiumState();
    expect(startState.zones.length).toBe(12);

    // Test zone updates
    updateZoneDensity('zone-a', 90);
    const updatedState = getStadiumState();
    const zoneA = updatedState.zones.find(z => z.id === 'zone-a');
    expect(zoneA?.density).toBe(90);
    expect(zoneA?.status).toBe('CRITICAL');

    // Test incidents dispatch
    addIncident('zone-b', 'CRITICAL', 'Simulated critical turnstile hardware freeze');
    const incidentState = getStadiumState();
    const targetInc = incidentState.incidents[0];
    expect(targetInc.severity).toBe('CRITICAL');
    expect(targetInc.zoneId).toBe('zone-b');

    // Test reset operations
    resetStadiumState();
    const resetedState = getStadiumState();
    const zoneAReset = resetedState.zones.find(z => z.id === 'zone-a');
    expect(zoneAReset?.density).toBe(42); // original INITIAL_ZONES value
  });
});

describe('6. Multi-Domain Adapter Engine', () => {

  test('adaptZone translates stadium zone properties to campus / hospital counterparts', () => {
    const rawZone = {
      id: 'zone-a',
      name: 'Gate A (North Entry)',
      location: 'North Entry, Plaza Level',
      density: 50,
      capacity: 1000,
      currentCount: 500,
      status: 'MEDIUM' as const,
      queueTimeMin: 12,
      amenities: {
        toilets: [{ id: 't-1', name: 'Restroom A', waitTimeMin: 5, distanceM: 20 }],
        concessions: [{ id: 'c-1', name: 'Strikers Tacos & Beers', waitTimeMin: 8, items: ['Beer', 'Pizza Slice'], distanceM: 30 }],
        merch: [{ id: 'm-1', name: 'FIFA Fan Shop', waitTimeMin: 4, distanceM: 40 }]
      }
    };

    // Campus adaptation
    const campusZone = adaptZone(rawZone, 'campus');
    expect(campusZone.name).toBe('North Campus Main Entry');
    expect(campusZone.location).toBe('North Archway, Ground Level');
    expect(campusZone.amenities.toilets[0].name).toBe('Campus Restroom A');
    expect(campusZone.amenities.concessions[0].name).toBe('Quad Express Coffee & Paninis');

    // Hospital adaptation
    const hospitalZone = adaptZone(rawZone, 'hospital');
    expect(hospitalZone.name).toBe('ER Ambulatory & Ambulance Intake');
    expect(hospitalZone.location).toBe('Emergency Entrance, Ground Level');
    expect(hospitalZone.amenities.concessions[0].items).toContain('Vitamin Drink');
    expect(hospitalZone.amenities.concessions[0].items).toContain('Fresh Salad');
    expect(hospitalZone.amenities.merch[0].name).toBe('Hospital Gift Store');
  });

  test('adaptIncident translates security incidents dynamically', () => {
    const rawIncident = {
      id: 'inc-1',
      zoneId: 'zone-c',
      zoneName: 'Gate C',
      severity: 'WARNING' as const,
      message: 'Crowded corridors near Turnstile Line C are slowing down spectators.',
      timestamp: '14:20',
      status: 'DISPATCHED' as const,
      mitigationPlan: 'Redirect spectators to Gates F and H'
    };

    const campusInc = adaptIncident(rawIncident, 'campus');
    expect(campusInc.zoneName).toBe('University Library Intake');
    expect(campusInc.message).toBe('Crowded corridors near Library Entry are slowing down students.');
    expect(campusInc.mitigationPlan).toBe('Redirect students to Halls F and H');

    const hospitalInc = adaptIncident(rawIncident, 'hospital');
    expect(hospitalInc.zoneName).toBe('Emergency Room Triage Queue');
    expect(hospitalInc.message).toBe('Crowded corridors near ER Triage Queue are slowing down patients.');
    expect(hospitalInc.mitigationPlan).toBe('Redirect patients to Wings F and H');
  });

  test('adaptRiskAssessment maps model insights dynamically', () => {
    const rawRisk = {
      level: 'HIGH' as const,
      score: 82,
      summary: 'Heavy weather and stadium ingress delays from high volume of spectators.',
      weatherImpact: 'Slight delay at outer gate sensors due to heavy heat.',
      transitImpact: 'Bus frequencies standard but concessions are surging.',
      recommendations: [
        'Speed up turnstiles.',
        'Redirect fans to secondary gates.'
      ]
    };

    const campusRisk = adaptRiskAssessment(rawRisk, 'campus');
    expect(campusRisk.summary).toBe('Heavy weather and campus ingress delays from high volume of students.');
    expect(campusRisk.recommendations[0]).toBe('Speed up entry checks.');
    expect(campusRisk.recommendations[1]).toBe('Redirect students to secondary halls.');

    const hospitalRisk = adaptRiskAssessment(rawRisk, 'hospital');
    expect(hospitalRisk.summary).toBe('Heavy weather and hospital ingress delays from high volume of patients.');
    expect(hospitalRisk.recommendations[0]).toBe('Speed up intake desks.');
    expect(hospitalRisk.recommendations[1]).toBe('Redirect patients to secondary clinic wings.');
  });

  test('DOMAIN_LABELS config contains all required properties', () => {
    expect(DOMAIN_LABELS.stadium.appName).toBe('ArenaFlow AI');
    expect(DOMAIN_LABELS.campus.appName).toBe('CampusFlow AI');
    expect(DOMAIN_LABELS.hospital.appName).toBe('MedFlow AI');
  });
});

