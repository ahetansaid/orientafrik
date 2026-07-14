import Link from 'next/link';
import { assertRole } from '@/lib/auth/guards';
import { seDeconnecter } from '@/features/compte/actions/connexion';
import { MARQUE } from '@/shared/lib/constants';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profil = await assertRole('admin');

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/tableau-de-bord" className="text-lg font-bold text-navy">
              {MARQUE} <span className="text-gold">admin</span>
            </Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/admin/tableau-de-bord" className="hover:text-navy">
                Vue d’ensemble
              </Link>
              <Link href="/admin/roles" className="hover:text-navy">
                Rôles
              </Link>
              <Link href="/admin/contenu" className="hover:text-navy">
                Contenu
              </Link>
              <Link href="/admin/partenariats" className="hover:text-navy">
                Partenariats
              </Link>
              <Link href="/admin/paiements" className="hover:text-navy">
                Paiements
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{profil.full_name ?? profil.email}</span>
            <form action={seDeconnecter}>
              <button className="text-slate-600 hover:text-navy">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
