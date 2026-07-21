import { cache } from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEcoleParSlug } from '@/features/ecole/data/ecoles.repo';
import { SOrienterBouton } from '@/features/ecole/ui/SOrienterBouton';
import { fourchetteFcfa } from '@/shared/lib/format';

// Chargement caché + notFound() dès generateMetadata -> vrai 404 (avant streaming).
const chargerEcole = cache(async (slug: string) => {
  const ecole = await getEcoleParSlug(db, slug);
  if (!ecole || ecole.statut !== 'published') notFound();
  return ecole;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ecole = await chargerEcole(slug);
  return { title: ecole.nom };
}

export default async function EcolePubliquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ecole = await chargerEcole(slug);

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-navy">{ecole.nom}</h1>
        {ecole.partenariat === 'active' && (
          <span className="rounded bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
            Partenaire
          </span>
        )}
      </div>
      {ecole.ville && <p className="mt-1 text-slate-500">{ecole.ville}</p>}
      {ecole.description && <p className="mt-4 text-slate-700">{ecole.description}</p>}

      {(ecole.fraisMinFcfa != null || ecole.fraisMaxFcfa != null) && (
        <p className="mt-4 text-sm text-slate-600">
          Frais annuels :{' '}
          <span className="font-medium">
            {fourchetteFcfa(ecole.fraisMinFcfa ?? 0, ecole.fraisMaxFcfa ?? 0)}
          </span>
        </p>
      )}

      <div className="mt-8">
        <SOrienterBouton ecoleId={ecole.id} />
      </div>
    </main>
  );
}
