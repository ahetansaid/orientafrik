import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { Wallet, CalendarCheck, Clock } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { listPourConsultant } from '@/features/consultant/data/consultations.repo';
import { fcfa } from '@/shared/lib/format';
import { StatCard } from '@/shared/ui/StatCard';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';

export const metadata: Metadata = { title: 'Tableau de bord consultant' };

export default async function DashboardConsultant() {
  const profil = await assertRole('consultant');
  const consultations = await listPourConsultant(db, profil.id);

  const encaisses = consultations.filter((c) => c.statut === 'confirmed' || c.statut === 'completed');
  const netTotal = encaisses.reduce((s, c) => s + c.netConsultantFcfa, 0);
  const enAttente = consultations.filter((c) => c.statut === 'pending').length;

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-2xl font-bold text-navy">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500">Ton activité en un coup d’œil.</p>
      </Reveal>
      <RevealGroup className="grid gap-4 sm:grid-cols-3">
        <RevealItem>
          <StatCard label="Revenu net (confirmé)" value={fcfa(netTotal)} icon={Wallet} tone="emerald" />
        </RevealItem>
        <RevealItem>
          <StatCard label="Consultations confirmées" value={String(encaisses.length)} icon={CalendarCheck} />
        </RevealItem>
        <RevealItem>
          <StatCard label="En attente de paiement" value={String(enAttente)} icon={Clock} tone="amber" />
        </RevealItem>
      </RevealGroup>
    </div>
  );
}
