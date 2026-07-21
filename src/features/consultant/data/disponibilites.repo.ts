import 'server-only';
import { and, eq, gt, asc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { disponibilites } from '@/lib/db/schema';
import type { CreneauValues } from '@/features/consultant/domain/dispo.schema';

export type DispoRow = typeof disponibilites.$inferSelect;

export async function listCreneauxLibres(db: DB, consultantId: string): Promise<DispoRow[]> {
  return db
    .select()
    .from(disponibilites)
    .where(
      and(
        eq(disponibilites.consultantId, consultantId),
        eq(disponibilites.isBooked, false),
        gt(disponibilites.startAt, new Date()),
      ),
    )
    .orderBy(asc(disponibilites.startAt));
}

export async function insererCreneaux(
  db: DB,
  consultantId: string,
  creneaux: CreneauValues[],
): Promise<void> {
  await db.insert(disponibilites).values(
    creneaux.map((c) => ({
      consultantId,
      startAt: new Date(c.startAt),
      endAt: new Date(c.endAt),
    })),
  );
}

export async function marquerReserve(db: DB, slotId: string): Promise<void> {
  await db.update(disponibilites).set({ isBooked: true }).where(eq(disponibilites.id, slotId));
}
