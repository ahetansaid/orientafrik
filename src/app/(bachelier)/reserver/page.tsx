import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { assertRole } from '@/lib/auth/guards';
import { listConsultantsVerifies } from '@/features/consultant/data/consultants.repo';
import { listTypes } from '@/features/consultant/data/consultations.repo';
import { listCreneauxLibres } from '@/features/consultant/data/disponibilites.repo';
import {
  ReserverForm,
  type ConsultantChoix,
  type TypeChoix,
} from '@/features/consultant/ui/ReserverForm';

export const metadata: Metadata = { title: 'Réserver une consultation' };

export default async function ReserverPage() {
  await assertRole('bachelier');
  const [consultants, types] = await Promise.all([
    listConsultantsVerifies(db),
    listTypes(db),
  ]);

  // Créneaux libres par consultant (peu de consultants en MVP).
  const choix: ConsultantChoix[] = await Promise.all(
    consultants.map(async (c) => {
      const creneaux = await listCreneauxLibres(db, c.id);
      return {
        id: c.id,
        nom: c.nom,
        creneaux: creneaux.map((s) => ({
          id: s.id,
          label: new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Africa/Porto-Novo',
          }).format(new Date(s.startAt)),
        })),
      };
    }),
  );

  const typesChoix: TypeChoix[] = types.map((t) => ({
    id: t.id,
    libelle: t.libelle,
    tarifFcfa: t.tarifFcfa,
    dureeMin: t.dureeMin,
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-navy">Réserver une consultation</h1>
        <p className="mt-1 text-slate-600">
          Un échange avec un conseiller pour affiner ton orientation.
        </p>
      </header>
      <ReserverForm consultants={choix} types={typesChoix} />
    </div>
  );
}
