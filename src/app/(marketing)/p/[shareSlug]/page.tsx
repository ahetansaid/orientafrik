import { cache } from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPlanPartage } from '@/features/bachelier/data/partage.repo';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';

// Chargement mis en cache (une seule requête par rendu, partagée metadata + page).
// notFound() est appelé DÈS generateMetadata pour garantir un vrai 404 avant que
// le shell HTML ne soit streamé (sinon statut 200 avec contenu 404).
const chargerPlan = cache(async (slug: string) => {
  const plan = await getPlanPartage(db, slug);
  if (!plan) notFound();
  return plan;
});

// Page publique NON-PII (prénom + top3 + scores). Aucune auth. C'est la porte de
// la boucle de croissance : partagée, elle affiche une carte OG personnalisée.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}): Promise<Metadata> {
  const { shareSlug } = await params;
  const plan = await chargerPlan(shareSlug);
  return {
    title: `Les 3 pistes de ${plan.prenom}`,
    description: `Découvre le Plan de Parcours de ${plan.prenom} et crée le tien gratuitement.`,
    openGraph: { title: `Les 3 pistes de ${plan.prenom} · ORIENTAFRIK` },
  };
}

export default async function PlanPartagePage({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}) {
  const { shareSlug } = await params;
  const plan = await chargerPlan(shareSlug);

  return (
    <main className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-blob absolute -left-20 -top-16 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="animate-blob absolute -right-16 top-24 h-72 w-72 rounded-full bg-navy/10 blur-3xl [animation-delay:4s]" />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Plan de Parcours · ORIENTAFRIK
          </p>
          <h1 className="mt-2 text-balance text-4xl font-extrabold tracking-tight text-navy">
            Les 3 pistes de <span className="text-gradient">{plan.prenom}</span>
          </h1>
        </Reveal>

        <RevealGroup className="mt-8 space-y-3">
          {plan.top3.map((f, i) => (
            <RevealItem key={f.slug}>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-navy">
                    <span className="mr-2 text-gold">{i + 1}.</span>
                    {f.titre}
                  </h2>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    {f.score}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${Math.max(0, Math.min(100, f.score))}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.pourquoi}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-10 rounded-2xl bg-navy p-6 text-center text-white shadow-xl shadow-navy/20">
            <p className="text-base font-medium">Et toi, quelles sont tes 3 pistes ?</p>
            <p className="mt-1 text-sm text-white/60">Ton plan gratuit en 2 minutes.</p>
            <Link
              href="/connexion"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 font-semibold text-white transition hover:bg-gold/90"
            >
              Créer mon plan gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
