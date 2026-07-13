import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPlan } from '@/features/bachelier/data/plans.repo';
import { InfographieParcours } from '@/features/bachelier/ui/InfographieParcours';
import { PaywallPdf } from '@/features/bachelier/ui/PaywallPdf';
import { PartagerBouton } from '@/features/bachelier/ui/PartagerBouton';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

export const metadata: Metadata = { title: 'Mon Plan de Parcours' };

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const plan = await getPlan(supabase, id);
  if (!plan) notFound();

  const data = plan.data as unknown as PlanParcours;

  return (
    <div className="space-y-6">
      <InfographieParcours plan={data} />

      <PartagerBouton planId={plan.id} />

      {plan.is_paid ? (
        <a
          href={`/api/v1/plan/${plan.id}/pdf`}
          className="block rounded-xl bg-emerald-600 p-5 text-center font-semibold text-white hover:bg-emerald-700"
        >
          Télécharger mon PDF
        </a>
      ) : (
        <PaywallPdf planId={plan.id} />
      )}
    </div>
  );
}
