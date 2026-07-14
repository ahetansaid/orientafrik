import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Carte de statistique réutilisable (dashboards). Présentationnel — l'animation
// d'apparition est gérée au niveau de la page (RevealGroup/RevealItem).
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'navy',
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  tone?: 'navy' | 'gold' | 'emerald' | 'amber';
}) {
  const tones = {
    navy: 'bg-navy/5 text-navy',
    gold: 'bg-gold/10 text-gold',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  } as const;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', tones[tone])}>
            <Icon className="h-4.5 w-4.5" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-navy">{value}</p>
    </div>
  );
}
