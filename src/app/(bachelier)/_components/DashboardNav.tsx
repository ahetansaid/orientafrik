'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, CalendarDays, type LucideIcon } from 'lucide-react';

const LIENS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/profil', label: 'Mon profil', icon: User },
  { href: '/consultations', label: 'Mes consultations', icon: CalendarDays },
];

// Navigation du tableau de bord avec état actif (cohérent avec la landing).
export function DashboardNav() {
  const path = usePathname();
  return (
    <nav className="flex gap-1">
      {LIENS.map((l) => {
        const actif = path === l.href || path.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={actif ? 'page' : undefined}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              actif
                ? 'bg-navy text-white shadow-sm shadow-navy/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-navy'
            }`}
          >
            <l.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
