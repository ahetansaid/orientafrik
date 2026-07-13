'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-2xl font-bold text-navy">Oups, quelque chose a cassé.</p>
      <p className="text-slate-600">On a été notifié. Tu peux réessayer.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white"
      >
        Réessayer
      </button>
    </main>
  );
}
