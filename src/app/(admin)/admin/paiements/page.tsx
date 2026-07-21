import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listPaiements } from '@/features/admin/data/admin.repo';
import { fcfa, dateBenin } from '@/shared/lib/format';
import type { PaymentStatut } from '@/lib/db/enums';

export const metadata: Metadata = { title: 'Admin — paiements' };

const TON: Record<PaymentStatut, string> = {
  pending: 'text-amber-600',
  succeeded: 'text-emerald-600',
  failed: 'text-red-600',
  refunded: 'text-slate-500',
};

export default async function PaiementsPage() {
  await assertRole('admin');
  const paiements = await listPaiements(db);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Paiements</h1>
      <p className="text-sm text-slate-600">
        Registre de vérité (écrit par le webhook Fedapay). Lecture seule.
      </p>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Objet</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paiements.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Aucun paiement pour l’instant.
                </td>
              </tr>
            ) : (
              paiements.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-slate-500">{dateBenin(p.createdAt)}</td>
                  <td className="px-4 py-3">{p.purpose}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{fcfa(p.amountFcfa)}</td>
                  <td className={`px-4 py-3 font-medium ${TON[p.statut]}`}>{p.statut}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
