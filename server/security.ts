import express from 'express';

// In-memory rate limiting map for security mitigation
const ipLimits = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP for write/AI routes

/**
 * Strict in-memory rate limiting middleware to prevent DDOS and API abuse on AI/write routes.
 */
export function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction): void {
  // Try to capture true client IP behind proxy
  const rawIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'anonymous';
  const ip = rawIp.split(',')[0].trim();
  const now = Date.now();
  
  const limitInfo = ipLimits.get(ip) || { count: 0, lastReset: now };

  if (now - limitInfo.lastReset > RATE_LIMIT_WINDOW_MS) {
    limitInfo.count = 0;
    limitInfo.lastReset = now;
  }

  if (limitInfo.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many requests. Operational safety rate limit exceeded. Please try again after 60 seconds.' });
    return;
  }

  limitInfo.count++;
  ipLimits.set(ip, limitInfo);
  next();
}

/**
 * Custom CORS middleware enforcing restrictive origin checks without wildcard leaks.
 */
export function corsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const allowedOrigins = [
    'https://arenaflow-ai.vercel.app',
    'https://arenaflow-ai-henna.vercel.app',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // Fallback securely to primary production domain or do not set
    res.setHeader('Access-Control-Allow-Origin', 'https://arenaflow-ai.vercel.app');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

/**
 * Sets secure HTTP security headers to prevent standard browser vulnerabilities.
 */
export function setSecurityHeaders(_req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // High quality CSP allowing the current application context and fonts/APIs securely
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' 'https://fonts.googleapis.com'; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: referrer; " +
    "connect-src 'self' ws: wss: https://*.googleapis.com https://*.run.app https://*.vercel.app http://localhost:* ws://localhost:*;"
  );
  
  next();
}

/**
 * Express middleware to reject malformed JSON payloads gracefully.
 */
export function jsonErrorHandler(
  err: any,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON payload. Payload must be valid JSON.' });
    return;
  }
  next(err);
}

/**
 * Prevents potential HTML injection or scripts by escaping special characters.
 */
export function sanitizeString(val: string, maxLength: number = 500): string {
  if (typeof val !== 'string') return '';
  const trimmed = val.substring(0, maxLength);
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Scrubs stack traces and internal diagnostics from clients in production environments.
 */
export function getSecureErrorMessage(err: any, fallback: string): string {
  if (process.env.NODE_ENV === 'production') {
    return fallback;
  }
  return err.message || fallback;
}
