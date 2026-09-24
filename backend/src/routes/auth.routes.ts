import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';
import { parse } from '../utils/validation.js';

export const authRoutes = Router();

authRoutes.post('/register', (req, res) => {
  res.status(201).json(authService.register(parse(registerSchema, req.body)));
});

authRoutes.post('/login', (req, res) => {
  res.json(authService.login(parse(loginSchema, req.body)));
});

authRoutes.get('/me', auth, (req, res) => {
  res.json({ user: authService.me(req.userId) });
});
