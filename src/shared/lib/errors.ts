import type { AppErrorCode } from '@/shared/lib/result';

// Erreur applicative typée levée par la couche data (repositories). Les actions
// la capturent, la transforment en ActionResult et la rapportent à Sentry.
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}
