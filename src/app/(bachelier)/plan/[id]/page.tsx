import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import type { Metadata } from 'next';
import { Download } from 'lucide-react';
import { assertRole } from '@/lib/auth/guards';
import { getPlan } from '@/features/bachelier/data/plans.repo';
import { InfographieParcours } from '@/features/bachelier/ui/InfographieParcours';
import { PaywallPdf } from '@/features/bachelier/ui/PaywallPdf';
import { PartagerBouton } from '@/features/bachelier/ui/PartagerBouton';
import { Reveal } from '@/shared/ui/motion/Reveal';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

export const metadata: Metadata = { title: 'Mon Plan de Parcours' };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profil = await assertRole('bachelier');
  const plan = await getPlan(db, id);
  if (!plan || plan.bachelierId !== profil.id) notFound();

  const data = plan.data as unknown as PlanParcours;

  return (
    <div className="space-y-6">
      <Reveal>
        <InfographieParcours plan={data} />
      </Reveal>

      <Reveal delay={0.08}>
        <PartagerBouton planId={plan.id} />
      </Reveal>

      <Reveal delay={0.16}>
        {plan.isPaid ? (
          <a
            href={`/api/v1/plan/${plan.id}/pdf`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-5 text-center font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            <Download className="h-5 w-5" /> Télécharger mon PDF
          </a>
        ) : (
          <PaywallPdf planId={plan.id} />
        )}
      </Reveal>
    </div>
  );
}
