import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { listProfiles, listEcoles, listPaiements } from '@/features/admin/data/admin.repo';
import { fcfa } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Admin — vue d’ensemble' };

export default async function AdminDashboard() {
  await assertRole('admin');
  const supabase = await createClient();
  const [profiles, ecoles, paiements] = await Promise.all([
    listProfiles(supabase),
    listEcoles(supabase),
    listPaiements(supabase),
  ]);

  const consultants = profiles.filter((p) => p.role === 'consultant').length;
  const encaisse = paiements
    .filter((p) => p.statut === 'succeeded')
    .reduce((s, p) => s + p.amount_fcfa, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Vue d’ensemble</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Utilisateurs" value={String(profiles.length)} href="/admin/roles" />
        <Stat label="Consultants" value={String(consultants)} href="/admin/roles" />
        <Stat label="Écoles" value={String(ecoles.length)} href="/admin/partenariats" />
        <Stat label="Encaissé" value={fcfa(encaisse)} href="/admin/paiements" />
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-navy">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </Link>
  );
}
