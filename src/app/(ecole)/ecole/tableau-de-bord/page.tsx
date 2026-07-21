import type { Metadata } from 'next';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Compass, FileText, GraduationCap, Wallet } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { listPourEcole } from '@/features/ecole/data/inscriptions.repo';
import { fcfa } from '@/shared/lib/format';
import { StatCard } from '@/shared/ui/StatCard';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';

export const metadata: Metadata = { title: 'Tableau de bord école' };

export default async function DashboardEcole() {
  const profil = await assertRole('ecole');
  const ecoleId = await getEcoleIdPourUser(db, profil.id);

  if (!ecoleId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
        Aucune école n’est encore rattachée à ton compte. Un administrateur doit t’associer à
        une école.
      </div>
    );
  }

  const inscriptions = await listPourEcole(db, ecoleId);
  const par = (s: string) => inscriptions.filter((i) => i.statut === s).length;
  const commissionDue = inscriptions
    .filter((i) => i.statut === 'inscrite')
    .reduce((sum, i) => sum + (i.commissionFcfa ?? 0), 0);

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Tableau de bord</h1>
            <p className="mt-1 text-sm text-slate-500">Ton funnel d’inscription en temps réel.</p>
          </div>
          <Link href="/ecole/candidatures" className="text-sm font-medium text-navy hover:underline">
            Voir les candidatures →
          </Link>
        </div>
      </Reveal>
      <RevealGroup className="grid gap-4 sm:grid-cols-4">
        <RevealItem>
          <StatCard label="Orientées" value={String(par('orientee'))} icon={Compass} />
        </RevealItem>
        <RevealItem>
          <StatCard label="Candidatures" value={String(par('candidature'))} icon={FileText} tone="gold" />
        </RevealItem>
        <RevealItem>
          <StatCard label="Inscrites" value={String(par('inscrite'))} icon={GraduationCap} tone="emerald" />
        </RevealItem>
        <RevealItem>
          <StatCard label="Commission due" value={fcfa(commissionDue)} icon={Wallet} tone="gold" />
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
