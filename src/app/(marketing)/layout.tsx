import Link from 'next/link';
import { MARQUE } from '@/shared/lib/constants';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold text-navy">
            {MARQUE}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/bourses" className="text-slate-600 hover:text-navy">
              Bourses
            </Link>
            <Link
              href="/connexion"
              className="rounded-lg bg-navy px-3 py-1.5 font-medium text-white hover:bg-navy/90"
            >
              Se connecter
            </Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        © {MARQUE} · Cotonou, Bénin
      </footer>
    </div>
  );
}
