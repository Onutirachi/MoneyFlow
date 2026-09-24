import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { accountsRoutes } from './accounts.routes.js';
import { authRoutes } from './auth.routes.js';
import { categoriesRoutes } from './categories.routes.js';
import { movementsRoutes } from './movements.routes.js';

export const routes = Router();

routes.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

routes.use('/auth', authRoutes);

// Rotas protegidas
routes.use('/accounts', auth, accountsRoutes);
routes.use('/categories', auth, categoriesRoutes);
routes.use('/movements', auth, movementsRoutes);
