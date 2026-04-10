import { Router } from 'express';
import translateRoutes from './translateRoutes.js';
import speechRoutes from './speechRoutes.js';
import ttsRoutes from './ttsRoutes.js';
import chatRoutes from './chatRoutes.js';
import { healthCheckDb } from '../config/database.js';
import { config } from '../config/env.js';

const router = Router();

router.get('/health', async (req, res) => {
  const db = await healthCheckDb();
  res.json({
    status: 'ok',
    service: 'KasaBridge AI API',
    database: db.ok ? 'connected' : config.databaseUrl ? 'error' : 'not_configured',
    ...(db.error && config.nodeEnv === 'development' ? { databaseError: db.error } : {}),
  });
});

router.use('/translate', translateRoutes);
router.use('/speech', speechRoutes);
router.use('/tts', ttsRoutes);
router.use('/ai', chatRoutes);

export default router;
