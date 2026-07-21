import 'server-only';
import { eq, asc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { ecoles } from '@/lib/db/schema';
import type { FicheEcoleValues } from '@/features/ecole/domain/cpa.schema';

export type EcoleRow = typeof ecoles.$inferSelect;

export async function getEcole(db: DB, id: string): Promise<EcoleRow | null> {
  const row = await db.query.ecoles.findFirst({ where: eq(ecoles.id, id) });
  return row ?? null;
}

export async function getEcoleParSlug(db: DB, slug: string): Promise<EcoleRow | null> {
  const row = await db.query.ecoles.findFirst({ where: eq(ecoles.slug, slug) });
  return row ?? null;
}

export async function listEcolesPubliees(db: DB): Promise<EcoleRow[]> {
  return db.select().from(ecoles).where(eq(ecoles.statut, 'published')).orderBy(asc(ecoles.nom));
}

// Mise à jour de la FICHE par un membre (colonnes non sensibles uniquement).
export async function majFiche(db: DB, id: string, v: FicheEcoleValues): Promise<void> {
  await db
    .update(ecoles)
    .set({
      nom: v.nom,
      ville: v.ville ?? null,
      description: v.description ?? null,
      fraisMinFcfa: v.fraisMinFcfa ?? null,
      fraisMaxFcfa: v.fraisMaxFcfa ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ecoles.id, id));
}
