import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { getEcole } from '@/features/ecole/data/ecoles.repo';
import { FicheForm } from '@/features/ecole/ui/FicheForm';

export const metadata: Metadata = { title: 'Ma fiche école' };

export default async function FichePage() {
  const profil = await assertRole('ecole');
  const supabase = await createClient();
  const ecoleId = await getEcoleIdPourUser(supabase, profil.id);
  const ecole = ecoleId ? await getEcole(supabase, ecoleId) : null;

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
          fraisMinFcfa: ecole.frais_min_fcfa,
          fraisMaxFcfa: ecole.frais_max_fcfa,
        }}
      />
    </div>
  );
}
