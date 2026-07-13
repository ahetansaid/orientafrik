import * as Sentry from '@sentry/nextjs';

// Initialisation Sentry côté serveur + edge. No-op sans DSN (dev local propre).
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  const runtime = process.env.NEXT_RUNTIME;
  if (runtime === 'nodejs' || runtime === 'edge') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === 'production',
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
