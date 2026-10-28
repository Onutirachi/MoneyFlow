import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import accounts from './accounts.routes.js';
import auth from './auth.routes.js';
import categories from './categories.routes.js';
import dashboard from './dashboard.routes.js';
import movements from './movements.routes.js';
import recurring from './recurring.routes.js';

const api = Router();

api.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
api.use('/auth', auth); // register/login públicos; /me protegido dentro do router

// tudo abaixo exige token
api.use('/accounts', requireAuth, accounts);
api.use('/categories', requireAuth, categories);
api.use('/movements', requireAuth, movements);
api.use('/recurring', requireAuth, recurring);
api.use('/dashboard', requireAuth, dashboard);

export default api;
