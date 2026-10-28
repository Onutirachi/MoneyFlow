import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import * as service from '../services/auth.service.js';
import { parse } from '../utils/validation.js';

const router = Router();

router.post('/register', async (req, res) => {
  res.status(201).json(await service.register(parse(registerSchema, req.body)));
});

router.post('/login', async (req, res) => {
  res.json(await service.login(parse(loginSchema, req.body)));
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: await service.me(req.userId) });
});

export default router;
