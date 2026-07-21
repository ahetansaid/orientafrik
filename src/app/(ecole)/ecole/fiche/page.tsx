import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { getEcole } from '@/features/ecole/data/ecoles.repo';
import { FicheForm } from '@/features/ecole/ui/FicheForm';

export const metadata: Metadata = { title: 'Ma fiche école' };

export default async function FichePage() {
  const profil = await assertRole('ecole');
  const ecoleId = await getEcoleIdPourUser(db, profil.id);
  const ecole = ecoleId ? await getEcole(db, ecoleId) : null;

  if (!ecole) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Aucune école rattachée à ton compte.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Ma fiche école</h1>
      <FicheForm
        defauts={{
          nom: ecole.nom,
          ville: ecole.ville ?? '',
          description: ecole.description ?? '',
          fraisMinFcfa: ecole.fraisMinFcfa,
          fraisMaxFcfa: ecole.fraisMaxFcfa,
        }}
      />
    </div>
  );
}
