export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (what = 'Recurso') => new AppError(404, 'NOT_FOUND', `${what} não encontrado`);

export const unauthorized = (message = 'Não autenticado') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const badRequest = (code: string, message: string) => new AppError(400, code, message);

export const conflict = (code: string, message: string) => new AppError(409, code, message);
