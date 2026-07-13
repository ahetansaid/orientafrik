import Link from 'next/link';
import { assertRole } from '@/lib/auth/guards';
import { seDeconnecter } from '@/features/compte/actions/connexion';
import { MARQUE } from '@/shared/lib/constants';

// Coquille protégée : seul un bachelier connecté accède à ce groupe (assertRole
// + RLS Postgres en garde ultime).
export default async function BachelierLayout({ children }: { children: React.ReactNode }) {
  const profil = await assertRole('bachelier');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/profil" className="text-lg font-bold text-navy">
            {MARQUE}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{profil.full_name ?? profil.email}</span>
            <form action={seDeconnecter}>
              <button className="text-slate-600 hover:text-navy">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
