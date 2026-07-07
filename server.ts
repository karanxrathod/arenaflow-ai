import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  getStadiumState, 
  updateZoneDensity, 
  resetStadiumState, 
  addIncident 
} from './server/state.js';
import { 
  getRiskAssessment, 
  getFanResponse 
} from './server/gemini.js';
import {
  rateLimiter,
  corsMiddleware,
  setSecurityHeaders,
  jsonErrorHandler,
  sanitizeString,
  getSecureErrorMessage
} from './server/security.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enforce security headers first
  app.use(setSecurityHeaders);

  // Restrictive CORS middleware
  app.use(corsMiddleware);

  // Parse JSON with built-in limit to prevent large payload attacks
  app.use(express.json({ limit: '10kb' }));

  // Rejects malformed JSON gracefully
  app.use(jsonErrorHandler);

  // Valid zones inside the stadium twin
  const VALID_ZONES = [
    'zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e', 'zone-f',
    'zone-g', 'zone-h', 'zone-i', 'zone-j', 'zone-k', 'zone-l'
  ];

  // ==================== API ROUTES ====================

  // Get full real-time stadium state
  app.get('/api/stadium-state', (_req, res) => {
    try {
      res.json(getStadiumState());
    } catch (err: any) {
      console.error('[API Error] Failed to retrieve stadium state:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'Failed to retrieve stadium state') });
    }
  });

  // Update a zone's crowd density (interactive simulation) - WRITING route, rate limited
  app.post('/api/update-density', rateLimiter, (req, res) => {
    try {
      const { zoneId, density } = req.body;
      
      // Strict parameter validations
      if (typeof zoneId !== 'string' || !VALID_ZONES.includes(zoneId)) {
        res.status(400).json({ error: 'Invalid or missing zoneId parameter.' });
        return;
      }
      if (typeof density !== 'number' || isNaN(density) || density < 0 || density > 100) {
        res.status(400).json({ error: 'Density must be a valid number between 0 and 100.' });
        return;
      }

      updateZoneDensity(zoneId, density);
      res.json(getStadiumState());
    } catch (err: any) {
      console.error('[API Error] Failed to update density:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'Failed to update zone density') });
    }
  });

  // Calculate live risk assessment using Gemini AI - AI-invoking route, rate limited
  app.post('/api/risk-assessment', rateLimiter, async (_req, res) => {
    try {
      const liveState = getStadiumState();
      const assessment = await getRiskAssessment(liveState);
      res.json(assessment);
    } catch (err: any) {
      console.error('[API Error] Risk Engine assessment failure:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'AI Risk Engine assessment failed') });
    }
  });

  // Chat with the multilingual navigation concierge powered by Gemini AI - AI-invoking route, rate limited
  app.post('/api/fan-chat', rateLimiter, async (req, res) => {
    try {
      const { message, history, language } = req.body;
      
      // Validation and sanitization
      if (typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({ error: 'Message parameter must be a non-empty string.' });
        return;
      }
      if (message.length > 1000) {
        res.status(400).json({ error: 'Message size limit exceeded.' });
        return;
      }

      const sanitizedMessage = sanitizeString(message, 1000);
      const sanitizedLang = typeof language === 'string' ? sanitizeString(language, 50) : 'English';

      // Validate history array shape
      let validatedHistory: Array<{ role: 'user' | 'model'; text: string }> = [];
      if (Array.isArray(history)) {
        validatedHistory = history
          .slice(-10) // Limit history to last 10 turns to prevent abuse
          .filter(h => h && typeof h === 'object' && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
          .map(h => ({
            role: h.role,
            text: sanitizeString(h.text, 500)
          }));
      }

      const liveState = getStadiumState();
      const responseText = await getFanResponse(sanitizedMessage, validatedHistory, liveState, sanitizedLang);
      res.json({ response: responseText });
    } catch (err: any) {
      console.error('[API Error] Fan chat handler failure:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'Fan assistant failed') });
    }
  });

  // Trigger an operational or security incident manually - WRITING route, rate limited
  app.post('/api/trigger-incident', rateLimiter, (req, res) => {
    try {
      const { zoneId, severity, message } = req.body;
      
      // Strict type and parameter validation
      if (typeof zoneId !== 'string' || !VALID_ZONES.includes(zoneId)) {
        res.status(400).json({ error: 'Invalid or missing zoneId parameter.' });
        return;
      }
      if (typeof severity !== 'string' || !['INFO', 'WARNING', 'CRITICAL'].includes(severity)) {
        res.status(400).json({ error: 'Severity must be INFO, WARNING, or CRITICAL.' });
        return;
      }
      if (typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({ error: 'Message parameter must be a non-empty string.' });
        return;
      }
      if (message.length > 500) {
        res.status(400).json({ error: 'Message length cannot exceed 500 characters.' });
        return;
      }

      const sanitizedMsg = sanitizeString(message, 500);
      addIncident(zoneId, severity as 'INFO' | 'WARNING' | 'CRITICAL', sanitizedMsg);
      res.json(getStadiumState());
    } catch (err: any) {
      console.error('[API Error] Failed to add incident:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'Failed to add incident') });
    }
  });

  // Reset the twin state to initials - WRITING route, rate limited
  app.post('/api/reset', rateLimiter, (_req, res) => {
    try {
      resetStadiumState();
      res.json(getStadiumState());
    } catch (err: any) {
      console.error('[API Error] Failed to reset twin state:', err);
      res.status(500).json({ error: getSecureErrorMessage(err, 'Failed to reset state') });
    }
  });

  // ==================== VITE MIDDLEWARE ====================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArenaFlow AI full-stack server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical server failure during initialization:', err);
});
