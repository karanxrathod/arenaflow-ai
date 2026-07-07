import { describe, test, expect } from 'vitest';
import { sanitizeInput, validateEmail, validateZoneId, validateLanguage } from '../utils/validators.js';
import { sanitizeString, getSecureErrorMessage } from '../../server/security.js';
import { getFallbackStadiumState, generateVendorPrepsForZones, getStatusFromDensity } from '../utils/fallbackData.js';

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
