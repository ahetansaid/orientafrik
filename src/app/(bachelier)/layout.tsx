import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { seDeconnecter } from '@/features/compte/actions/connexion';
import { MARQUE } from '@/shared/lib/constants';
import { DashboardNav } from './_components/DashboardNav';

// Coquille protégée : seul un bachelier connecté accède à ce groupe (assertRole
// + scoping d'appartenance en garde ultime). Langage visuel aligné sur la landing.
export default async function BachelierLayout({ children }: { children: React.ReactNode }) {
  const profil = await assertRole('bachelier');
  const nom = profil.fullName ?? profil.email;
  const initiale = (nom?.charAt(0) ?? 'B').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-5">
            <Link
              href="/profil"
              className="flex items-center gap-2 text-lg font-bold text-navy"
            >
              <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
              <span className="hidden sm:inline">{MARQUE}</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                {initiale}
              </span>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-600 sm:block">
                {nom}
              </span>
            </span>
            <form action={seDeconnecter}>
              <button
                type="submit"
                aria-label="Déconnexion"
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-navy"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
