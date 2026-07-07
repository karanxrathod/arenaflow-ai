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

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // ==================== API ROUTES ====================

  // Get full real-time stadium state
  app.get('/api/stadium-state', (req, res) => {
    try {
      res.json(getStadiumState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve stadium state' });
    }
  });

  // Update a zone's crowd density (interactive simulation)
  app.post('/api/update-density', (req, res) => {
    try {
      const { zoneId, density } = req.body;
      if (!zoneId || typeof density !== 'number') {
        res.status(400).json({ error: 'zoneId (string) and density (number) are required' });
        return;
      }
      updateZoneDensity(zoneId, density);
      res.json(getStadiumState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update zone density' });
    }
  });

  // Calculate live risk assessment using Gemini AI
  app.post('/api/risk-assessment', async (req, res) => {
    try {
      const liveState = getStadiumState();
      const assessment = await getRiskAssessment(liveState);
      res.json(assessment);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Risk Engine assessment failed' });
    }
  });

  // Chat with the multilingual navigation concierge powered by Gemini AI
  app.post('/api/fan-chat', async (req, res) => {
    try {
      const { message, history, language } = req.body;
      if (!message) {
        res.status(400).json({ error: 'message string is required' });
        return;
      }
      const liveState = getStadiumState();
      const responseText = await getFanResponse(message, history || [], liveState, language || 'English');
      res.json({ response: responseText });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Fan assistant failed' });
    }
  });

  // Trigger an operational or security incident manually
  app.post('/api/trigger-incident', (req, res) => {
    try {
      const { zoneId, severity, message } = req.body;
      if (!zoneId || !severity || !message) {
        res.status(400).json({ error: 'zoneId, severity, and message are required' });
        return;
      }
      addIncident(zoneId, severity, message);
      res.json(getStadiumState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add incident' });
    }
  });

  // Reset the twin state to initials
  app.post('/api/reset', (req, res) => {
    try {
      resetStadiumState();
      res.json(getStadiumState());
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to reset state' });
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
    app.get('*', (req, res) => {
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
