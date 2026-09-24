import type { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json({ error: { code: 'NOT_FOUND', message: `Rota ${req.method} ${req.path} não existe` } });
}
