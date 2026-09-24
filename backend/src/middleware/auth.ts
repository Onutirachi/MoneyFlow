import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { unauthorized } from '../errors.js';
import { db } from '../db/jsonDb.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware `auth` */
      userId: string;
    }
  }
}

export function auth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw unauthorized();

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    const userId = payload.sub;
    if (!userId || !db.data.users.some((u) => u.id === userId)) throw unauthorized();
    req.userId = userId;
  } catch {
    throw unauthorized('Sessão inválida ou expirada');
  }
  next();
}
