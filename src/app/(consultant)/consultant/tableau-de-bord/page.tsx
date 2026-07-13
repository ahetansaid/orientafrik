import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { listPourConsultant } from '@/features/consultant/data/consultations.repo';
import { fcfa } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Tableau de bord consultant' };

export default async function DashboardConsultant() {
  const profil = await assertRole('consultant');
  const supabase = await createClient();
  const consultations = await listPourConsultant(supabase, profil.id);

  const encaisses = consultations.filter((c) => c.statut === 'confirmed' || c.statut === 'completed');
  const netTotal = encaisses.reduce((s, c) => s + c.net_consultant_fcfa, 0);
  const enAttente = consultations.filter((c) => c.statut === 'pending').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Tableau de bord</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Revenu net (confirmé)" value={fcfa(netTotal)} />
        <Stat label="Consultations confirmées" value={String(encaisses.length)} />
        <Stat label="En attente de paiement" value={String(enAttente)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}
