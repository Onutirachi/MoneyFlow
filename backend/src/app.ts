import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import api from './routes/index.js';

export function createApp() {
  const app = express();
  const origins = config.CORS_ORIGIN.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors(origins.length > 0 ? { origin: origins } : {}));
  app.use(express.json());
  app.use('/api', api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
