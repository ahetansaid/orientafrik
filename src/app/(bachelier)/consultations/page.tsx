import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { listPourBachelier } from '@/features/consultant/data/consultations.repo';
import { fcfa, dateBenin } from '@/shared/lib/format';
import type { ConsultationStatut } from '@/lib/supabase/enums';

export const metadata: Metadata = { title: 'Mes consultations' };

const LIBELLE_STATUT: Record<ConsultationStatut, string> = {
  pending: 'Paiement en attente',
  confirmed: 'Confirmée',
  completed: 'Terminée',
  cancelled: 'Annulée',
  no_show: 'Absent',
};

export default async function MesConsultations() {
  const profil = await assertRole('bachelier');
  const supabase = await createClient();
  const consultations = await listPourBachelier(supabase, profil.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Mes consultations</h1>
        <Link
          href="/reserver"
          className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy/90"
        >
          Réserver
        </Link>
      </div>

      {consultations.length === 0 ? (
        <p className="text-slate-500">
          Tu n’as pas encore de consultation.{' '}
          <Link href="/reserver" className="text-navy underline">
            En réserver une
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {consultations.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm"
            >
              <span className="font-medium text-navy">
                {c.scheduled_at ? dateBenin(c.scheduled_at) : 'Sans créneau'}
              </span>
              <span className="text-slate-500">
                {LIBELLE_STATUT[c.statut]} · {c.prix_fcfa === 0 ? 'gratuit' : fcfa(c.prix_fcfa)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
