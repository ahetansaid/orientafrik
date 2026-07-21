import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listProfiles, listEcoles } from '@/features/admin/data/admin.repo';
import { RoleControls } from '@/features/admin/ui/RoleControls';

export const metadata: Metadata = { title: 'Admin — rôles' };

export default async function RolesPage() {
  await assertRole('admin');
  const [profiles, ecoles] = await Promise.all([listProfiles(db), listEcoles(db)]);
  const ecoleOptions = ecoles.map((e) => ({ id: e.id, nom: e.nom }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Rôles & provisioning</h1>
        <p className="mt-1 text-sm text-slate-600">
          Les rôles consultant / école sont attribués ici (jamais en self-db).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle & rattachement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-navy">{p.fullName ?? '—'}</div>
                  <div className="text-slate-500">{p.email}</div>
                </td>
                <td className="px-4 py-3">
                  <RoleControls userId={p.id} role={p.role} ecoles={ecoleOptions} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
