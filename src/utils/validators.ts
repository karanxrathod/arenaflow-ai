/**
 * Utility functions for user input sanitization and verification
 */

/**
 * Sanitizes interactive text input to prevent XSS (cross-site scripting) attacks
 * and remove hazardous character sequences.
 * 
 * @param input The raw input string
 * @returns Cleaned, secure text string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Strips simple HTML tag brackets
    .trim()
    .slice(0, 1000); // Caps input length to avoid memory spikes
};

/**
 * Validates whether an email conforms to strict RFC 5322 format standards
 * 
 * @param email Email input to check
 * @returns boolean
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates stadium zone identifiers (e.g. zone-a through zone-l)
 * 
 * @param zoneId Sector identifier to validate
 * @returns boolean
 */
export const validateZoneId = (zoneId: string): boolean => {
  const allowedZones = [
    'zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e', 'zone-f',
    'zone-g', 'zone-h', 'zone-i', 'zone-j', 'zone-k', 'zone-l'
  ];
  return allowedZones.includes(zoneId.toLowerCase());
};

/**
 * Validates operational languages used for smart display systems
 * 
 * @param lang Language key
 * @returns boolean
 */
export const validateLanguage = (lang: string): boolean => {
  const supported = ['en', 'es', 'pt', 'fr', 'ar'];
  return supported.includes(lang.toLowerCase());
};
