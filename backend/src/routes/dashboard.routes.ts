import { Router } from 'express';
import { dashboardQuerySchema } from '../schemas/dashboard.schema.js';
import * as dashboard from '../services/dashboard.service.js';
import { parse } from '../utils/validation.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', (req, res) => {
  res.json(dashboard.get(req.userId, parse(dashboardQuerySchema, req.query)));
});
