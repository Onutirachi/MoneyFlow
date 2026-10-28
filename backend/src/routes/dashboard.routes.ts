import { Router } from 'express';
import { dashboardQuery } from '../schemas/dashboard.schema.js';
import { getDashboard } from '../services/dashboard.service.js';
import { parse } from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await getDashboard(req.userId, parse(dashboardQuery, req.query)));
});

export default router;
