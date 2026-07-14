import Link from 'next/link';
import Image from 'next/image';
import { MARQUE } from '@/shared/lib/constants';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-navy">
            <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            {MARQUE}
          </Link>
          <div className="flex items-center gap-1 text-sm sm:gap-4">
            <Link href="/bourses" className="rounded-lg px-3 py-1.5 text-slate-600 hover:text-navy">
              Bourses
            </Link>
            <Link
              href="/connexion"
              className="rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-navy/90"
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
