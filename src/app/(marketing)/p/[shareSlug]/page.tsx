import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPlanPartage } from '@/features/bachelier/data/partage.repo';

// Page publique NON-PII (prénom + top3 + scores). Aucune auth. C'est la porte de
// la boucle de croissance : partagée, elle affiche une carte OG personnalisée.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ shareSlug: string }>;
}): Promise<Metadata> {
  const { shareSlug } = await params;
  const supabase = await createClient();
  const plan = await getPlanPartage(supabase, shareSlug);
  if (!plan) return { title: 'Plan de Parcours' };
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
  const supabase = await createClient();
  const plan = await getPlanPartage(supabase, shareSlug);
  if (!plan) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">
        Plan de Parcours · ORIENTAFRIK
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">Les 3 pistes de {plan.prenom}</h1>

      <ul className="mt-6 space-y-3">
        {plan.top3.map((f, i) => (
          <li key={f.slug} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold text-navy">
                <span className="mr-2 text-gold">{i + 1}.</span>
                {f.titre}
              </h2>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {f.score}% compatible
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{f.pourquoi}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-xl bg-navy p-5 text-center text-white">
        <p className="text-sm">Et toi, quelles sont tes 3 pistes ?</p>
        <Link
          href="/connexion"
          className="mt-3 inline-block rounded-lg bg-gold px-5 py-2.5 font-semibold text-white hover:bg-gold/90"
        >
          Créer mon plan gratuit
        </Link>
      </div>
    </main>
  );
}
