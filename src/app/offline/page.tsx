import Link from 'next/link';
import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { MARQUE } from '@/shared/lib/constants';

export const metadata: Metadata = { title: 'Hors connexion' };

// Page de repli servie par le service worker quand la navigation échoue (offline).
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy/5 text-navy">
        <WifiOff className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-2xl font-bold text-navy">Tu es hors connexion</h1>
        <p className="mt-2 max-w-sm text-slate-600">
          {MARQUE} a besoin d’internet pour cette page. Reconnecte-toi, puis réessaie.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
      >
        Réessayer
      </Link>
    </main>
  );
}
