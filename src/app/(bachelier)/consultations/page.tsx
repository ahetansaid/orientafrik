import type { Metadata } from 'next';
import { db } from '@/lib/db';
import Link from 'next/link';
import { CalendarDays, CalendarPlus, Plus } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { listPourBachelier } from '@/features/consultant/data/consultations.repo';
import { fcfa, dateBenin } from '@/shared/lib/format';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';
import type { ConsultationStatut } from '@/lib/db/enums';

export const metadata: Metadata = { title: 'Mes consultations' };

const STATUT: Record<ConsultationStatut, { label: string; classe: string }> = {
  pending: { label: 'Paiement en attente', classe: 'bg-amber-50 text-amber-700 ring-amber-200' },
  confirmed: { label: 'Confirmée', classe: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  completed: { label: 'Terminée', classe: 'bg-slate-100 text-slate-600 ring-slate-200' },
  cancelled: { label: 'Annulée', classe: 'bg-red-50 text-red-700 ring-red-200' },
  no_show: { label: 'Absent', classe: 'bg-red-50 text-red-700 ring-red-200' },
};

export default async function MesConsultations() {
  const profil = await assertRole('bachelier');
  const consultations = await listPourBachelier(db, profil.id);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy">
              <CalendarDays className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">Mes consultations</h1>
            <p className="mt-1 text-slate-600">
              Tes rendez-vous d’accompagnement, du paiement à la séance.
            </p>
          </div>
          <Link
            href="/reserver"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy/20 transition hover:bg-navy/90"
          >
            <Plus className="h-4 w-4" /> Réserver
          </Link>
        </div>
      </Reveal>

      {consultations.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <CalendarPlus className="h-6 w-6" />
            </span>
            <p className="mt-4 font-semibold text-navy">Aucune consultation pour l’instant</p>
            <p className="mt-1 text-sm text-slate-500">
              Réserve un créneau avec un consultant pour affiner ton orientation.
            </p>
            <Link
              href="/reserver"
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy/90"
            >
              <Plus className="h-4 w-4" /> Réserver une consultation
            </Link>
          </div>
        </Reveal>
      ) : (
        <RevealGroup className="space-y-3">
          {consultations.map((c) => {
            const s = STATUT[c.statut];
            return (
              <RevealItem key={c.id}>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md hover:shadow-navy/5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/5 text-navy">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {c.scheduledAt ? dateBenin(c.scheduledAt) : 'Créneau à définir'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.prixFcfa === 0 ? 'Gratuit' : fcfa(c.prixFcfa)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${s.classe}`}
                  >
                    {s.label}
                  </span>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
