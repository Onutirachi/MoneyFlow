export interface ErrorDetail {
  path: string;
  message: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetail[] | undefined;

  constructor(status: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = 'Recurso não encontrado') =>
  new AppError(404, 'NOT_FOUND', message);
export const badRequest = (code: string, message: string) => new AppError(400, code, message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const unauthorized = (code = 'UNAUTHORIZED', message = 'Não autenticado') =>
  new AppError(401, code, message);
