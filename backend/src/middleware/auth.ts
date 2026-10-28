import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query } from '../db/pool.js';
import { unauthorized } from '../errors.js';
import { UUID_RE } from '../utils/validation.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const [scheme, token] = (req.header('authorization') ?? '').split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) throw unauthorized();

  let userId: string;
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') throw new Error('sub');
    userId = payload.sub;
  } catch {
    throw unauthorized('UNAUTHORIZED', 'Token inválido ou expirado');
  }
  // usuário apagado (ex.: depois de `npm run seed`) com token ainda válido → 401, e o front desloga
  const exists =
    UUID_RE.test(userId) && (await query('SELECT 1 FROM users WHERE id = $1', [userId])).length > 0;
  if (!exists) throw unauthorized('UNAUTHORIZED', 'Sessão inválida ou expirada');
  req.userId = userId;
  next();
};
