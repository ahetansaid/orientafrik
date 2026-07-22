import Link from 'next/link';
import Image from 'next/image';
import { MARQUE, SLOGAN } from '@/shared/lib/constants';

const NAV = [
  { href: '/#comment', label: 'Comment ça marche' },
  { href: '/#plan', label: 'Ton plan' },
  { href: '/bourses', label: 'Bourses' },
  { href: '/#faq', label: 'Questions' },
];

const FOOTER_COLS = [
  {
    titre: 'Plateforme',
    liens: [
      { href: '/#comment', label: 'Comment ça marche' },
      { href: '/#plan', label: 'Ton Plan de Parcours' },
      { href: '/#pour-qui', label: 'Pour qui ?' },
      { href: '/bourses', label: 'Bourses' },
    ],
  },
  {
    titre: 'Compte',
    liens: [
      { href: '/connexion', label: 'Se connecter' },
      { href: '/connexion', label: 'Créer mon plan' },
      { href: '/#faq', label: 'Questions fréquentes' },
    ],
  },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-navy">
            <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
            {MARQUE}
          </Link>
          <div className="hidden items-center gap-1 text-sm md:flex">
            {NAV.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-navy"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/connexion"
              className="hidden rounded-lg px-3 py-1.5 font-medium text-slate-600 transition hover:text-navy sm:block"
            >
              Se connecter
            </Link>
            <Link
              href="/connexion"
              className="rounded-lg bg-navy px-4 py-2 font-medium text-white transition hover:bg-navy/90"
            >
              Créer mon plan
            </Link>
          </div>
        </nav>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-navy">
              <Image src="/icon.svg" alt="" width={28} height={28} className="rounded-lg" />
              {MARQUE}
            </Link>
            <p className="mt-3 max-w-xs text-sm text-slate-500">{SLOGAN}</p>
            <p className="mt-4 text-xs text-slate-400">
              Plateforme d’orientation post-bac au Bénin · bacheliers, écoles &amp; consultants.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.titre}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-navy">
                {col.titre}
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.liens.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-slate-500 transition hover:text-navy">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row">
            <p>© {new Date().getFullYear()} {MARQUE} · Cotonou, Bénin</p>
            <p>Fait avec soin pour les bacheliers béninois 🇧🇯</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
