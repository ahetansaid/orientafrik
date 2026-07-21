import 'server-only';
import { eq, desc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { inscriptionsEcole } from '@/lib/db/schema';
import type { InscriptionStatut } from '@/lib/db/enums';

export type InscriptionRow = typeof inscriptionsEcole.$inferSelect;

export async function listPourEcole(db: DB, ecoleId: string): Promise<InscriptionRow[]> {
  return db
    .select()
    .from(inscriptionsEcole)
    .where(eq(inscriptionsEcole.ecoleId, ecoleId))
    .orderBy(desc(inscriptionsEcole.orienteeAt));
}

export async function listPourBachelier(db: DB, bachelierId: string): Promise<InscriptionRow[]> {
  return db
    .select()
    .from(inscriptionsEcole)
    .where(eq(inscriptionsEcole.bachelierId, bachelierId))
    .orderBy(desc(inscriptionsEcole.orienteeAt));
}

export async function getInscription(db: DB, id: string): Promise<InscriptionRow | null> {
  const row = await db.query.inscriptionsEcole.findFirst({ where: eq(inscriptionsEcole.id, id) });
  return row ?? null;
}

// Un bachelier s'oriente vers une école (entrée du funnel, statut 'orientee').
export async function creerOrientation(
  db: DB,
  args: { bachelierId: string; ecoleId: string; planId: string | null },
): Promise<string> {
  const [row] = await db
    .insert(inscriptionsEcole)
    .values({ bachelierId: args.bachelierId, ecoleId: args.ecoleId, planId: args.planId })
    .returning({ id: inscriptionsEcole.id });
  return row!.id;
}

// Avancement du funnel (membre école / admin). Fixe commission + confirmed_by à l'inscription.
export async function avancerStatut(
  db: DB,
  id: string,
  statut: InscriptionStatut,
  opts: { commissionFcfa?: number | null; confirmedBy?: string } = {},
): Promise<void> {
  const patch: Partial<typeof inscriptionsEcole.$inferInsert> = { statut };
  if (statut === 'inscrite') {
    patch.commissionFcfa = opts.commissionFcfa ?? null;
    patch.confirmedBy = opts.confirmedBy ?? null;
    patch.inscriteAt = new Date();
  }
  await db.update(inscriptionsEcole).set(patch).where(eq(inscriptionsEcole.id, id));
}
