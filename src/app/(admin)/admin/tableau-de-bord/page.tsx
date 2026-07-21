import type { Metadata } from 'next';
import { db } from '@/lib/db';
import Link from 'next/link';
import { Users, UserCog, School, Wallet } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { listProfiles, listEcoles, listPaiements } from '@/features/admin/data/admin.repo';
import { fcfa } from '@/shared/lib/format';
import { StatCard } from '@/shared/ui/StatCard';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';

export const metadata: Metadata = { title: 'Admin — vue d’ensemble' };

export default async function AdminDashboard() {
  await assertRole('admin');
  const [profiles, ecoles, paiements] = await Promise.all([
    listProfiles(db),
    listEcoles(db),
    listPaiements(db),
  ]);

  const consultants = profiles.filter((p) => p.role === 'consultant').length;
  const encaisse = paiements
    .filter((p) => p.statut === 'succeeded')
    .reduce((s, p) => s + p.amountFcfa, 0);

  const cartes = [
    { label: 'Utilisateurs', value: String(profiles.length), href: '/admin/roles', icon: Users, tone: 'navy' as const },
    { label: 'Consultants', value: String(consultants), href: '/admin/roles', icon: UserCog, tone: 'gold' as const },
    { label: 'Écoles', value: String(ecoles.length), href: '/admin/partenariats', icon: School, tone: 'navy' as const },
    { label: 'Encaissé', value: fcfa(encaisse), href: '/admin/paiements', icon: Wallet, tone: 'emerald' as const },
  ];

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-2xl font-bold text-navy">Vue d’ensemble</h1>
        <p className="mt-1 text-sm text-slate-500">Pilotage de la plateforme.</p>
      </Reveal>
      <RevealGroup className="grid gap-4 sm:grid-cols-4">
        {cartes.map((c) => (
          <RevealItem key={c.label}>
            <Link href={c.href} className="block">
              <StatCard label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
