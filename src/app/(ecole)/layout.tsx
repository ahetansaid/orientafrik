import Link from 'next/link';
import { assertRole } from '@/lib/auth/guards';
import { seDeconnecter } from '@/features/compte/actions/connexion';
import { MARQUE } from '@/shared/lib/constants';

export default async function EcoleLayout({ children }: { children: React.ReactNode }) {
  const profil = await assertRole('ecole');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/ecole/tableau-de-bord" className="text-lg font-bold text-navy">
              {MARQUE}
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/ecole/tableau-de-bord" className="hover:text-navy">
                Tableau de bord
              </Link>
              <Link href="/ecole/candidatures" className="hover:text-navy">
                Candidatures
              </Link>
              <Link href="/ecole/fiche" className="hover:text-navy">
                Ma fiche
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{profil.fullName ?? profil.email}</span>
            <form action={seDeconnecter}>
              <button className="text-slate-600 hover:text-navy">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
