import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listCreneauxLibres } from '@/features/consultant/data/disponibilites.repo';
import { CreneauForm } from '@/features/consultant/ui/CreneauForm';
import { dateBenin } from '@/shared/lib/format';

export const metadata: Metadata = { title: 'Mes disponibilités' };

export default async function DisponibilitesPage() {
  const profil = await assertRole('consultant');
  const creneaux = await listCreneauxLibres(db, profil.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Mes disponibilités</h1>
      <CreneauForm />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Créneaux libres à venir
        </h2>
        {creneaux.length === 0 ? (
          <p className="text-slate-500">Aucun créneau libre pour l’instant.</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {creneaux.map((c) => (
              <li key={c.id} className="px-4 py-3 text-sm">
                {dateBenin(c.startAt)} — {new Date(c.endAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'Africa/Porto-Novo',
                })}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
