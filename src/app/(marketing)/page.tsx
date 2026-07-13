import Link from 'next/link';
import { SLOGAN } from '@/shared/lib/constants';

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">
        Orientation post-bac · Bénin
      </p>
      <h1 className="mt-3 text-balance text-4xl font-bold text-navy sm:text-5xl">{SLOGAN}</h1>
      <p className="mx-auto mt-4 max-w-xl text-slate-600">
        Réponds à quelques questions, reçois ton Plan de Parcours : 3 filières faites pour toi,
        les écoles à considérer et les bourses à viser.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/connexion"
          className="rounded-lg bg-navy px-6 py-3 font-semibold text-white hover:bg-navy/90"
        >
          Créer mon plan gratuit
        </Link>
      </div>
    </main>
  );
}
