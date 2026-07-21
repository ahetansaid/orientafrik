import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listEcoles } from '@/features/admin/data/admin.repo';
import { PartenariatForm } from '@/features/admin/ui/PartenariatForm';

export const metadata: Metadata = { title: 'Admin — partenariats' };

export default async function PartenariatsPage() {
  await assertRole('admin');
  const ecoles = await listEcoles(db);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Partenariats & commissions</h1>
        <p className="mt-1 text-sm text-slate-600">
          La commission (plancher) devient due à l’inscription confirmée d’un bachelier.
        </p>
      </div>

      <div className="space-y-3">
        {ecoles.map((e) => (
          <PartenariatForm
            key={e.id}
            d={{
              ecoleId: e.id,
              nom: e.nom,
              partenariat: e.partenariat,
              commissionMinFcfa: e.commissionMinFcfa,
              commissionMaxFcfa: e.commissionMaxFcfa,
            }}
          />
        ))}
      </div>
    </div>
  );
}
