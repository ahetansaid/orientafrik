import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { listPourEcole } from '@/features/ecole/data/inscriptions.repo';
import { CandidatureActions } from '@/features/ecole/ui/CandidatureActions';
import { fcfa, dateBenin } from '@/shared/lib/format';
import type { InscriptionStatut } from '@/lib/db/enums';

export const metadata: Metadata = { title: 'Candidatures' };

const LIBELLE: Record<InscriptionStatut, string> = {
  orientee: 'Orientée',
  candidature: 'Candidature',
  inscrite: 'Inscrite',
  annulee: 'Annulée',
};

export default async function CandidaturesPage() {
  const profil = await assertRole('ecole');
  const ecoleId = await getEcoleIdPourUser(db, profil.id);
  if (!ecoleId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Aucune école rattachée à ton compte.
      </div>
    );
  }

  const inscriptions = await listPourEcole(db, ecoleId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Candidatures</h1>
      {inscriptions.length === 0 ? (
        <p className="text-slate-500">Aucun bachelier orienté vers ton école pour l’instant.</p>
      ) : (
        <ul className="space-y-3">
          {inscriptions.map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"
            >
              <div>
                <p className="font-medium text-navy">{LIBELLE[i.statut]}</p>
                <p className="text-slate-500">
                  Orientée le {dateBenin(i.orienteeAt)}
                  {i.statut === 'inscrite' && i.commissionFcfa != null && (
                    <> · commission {fcfa(i.commissionFcfa)}</>
                  )}
                </p>
              </div>
              <CandidatureActions id={i.id} statut={i.statut} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
