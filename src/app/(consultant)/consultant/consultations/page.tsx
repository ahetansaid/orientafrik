import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listPourConsultant } from '@/features/consultant/data/consultations.repo';
import { ConsultationActions } from '@/features/consultant/ui/ConsultationActions';
import { fcfa, dateBenin } from '@/shared/lib/format';
import type { ConsultationStatut } from '@/lib/db/enums';

export const metadata: Metadata = { title: 'Mes consultations' };

const LIBELLE_STATUT: Record<ConsultationStatut, string> = {
  pending: 'En attente de paiement',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'Absent',
};

export default async function ConsultationsConsultant() {
  const profil = await assertRole('consultant');
  const consultations = await listPourConsultant(db, profil.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mes consultations</h1>
      {consultations.length === 0 ? (
        <p className="text-slate-500">Aucune consultation pour l’instant.</p>
      ) : (
        <ul className="space-y-3">
          {consultations.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"
            >
              <div>
                <p className="font-medium text-navy">
                  {c.scheduledAt ? dateBenin(c.scheduledAt) : 'Sans créneau'}
                </p>
                <p className="text-slate-500">
                  {LIBELLE_STATUT[c.statut]} · net {fcfa(c.netConsultantFcfa)}
                </p>
              </div>
              {c.statut === 'confirmed' && <ConsultationActions id={c.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
