import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { listPourEcole } from '@/features/ecole/data/inscriptions.repo';
import { fcfa } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Tableau de bord école' };

export default async function DashboardEcole() {
  const profil = await assertRole('ecole');
  const supabase = await createClient();
  const ecoleId = await getEcoleIdPourUser(supabase, profil.id);

  if (!ecoleId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Aucune école n’est encore rattachée à ton compte. Un administrateur doit t’associer à
        une école.
      </div>
    );
  }

  const inscriptions = await listPourEcole(supabase, ecoleId);
  const par = (s: string) => inscriptions.filter((i) => i.statut === s).length;
  const commissionDue = inscriptions
    .filter((i) => i.statut === 'inscrite')
    .reduce((sum, i) => sum + (i.commission_fcfa ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Tableau de bord</h1>
        <Link href="/ecole/candidatures" className="text-sm text-navy underline">
          Voir les candidatures
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Orientées" value={String(par('orientee'))} />
        <Stat label="Candidatures" value={String(par('candidature'))} />
        <Stat label="Inscrites" value={String(par('inscrite'))} />
        <Stat label="Commission due" value={fcfa(commissionDue)} />
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
