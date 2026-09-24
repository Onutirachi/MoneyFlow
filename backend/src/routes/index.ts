import { Router } from 'express';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
