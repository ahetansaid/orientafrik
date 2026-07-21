import 'server-only';
import { eq, desc, asc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { consultations, consultationTypes } from '@/lib/db/schema';
import type { ConsultationStatut } from '@/lib/db/enums';

export type ConsultationRow = typeof consultations.$inferSelect;
export type ConsultationTypeRow = typeof consultationTypes.$inferSelect;

export async function listTypes(db: DB): Promise<ConsultationTypeRow[]> {
  return db.select().from(consultationTypes).orderBy(asc(consultationTypes.tarifFcfa));
}

export async function getType(db: DB, typeId: string): Promise<ConsultationTypeRow | null> {
  const row = await db.query.consultationTypes.findFirst({
    where: eq(consultationTypes.id, typeId),
  });
  return row ?? null;
}

export async function insererConsultation(
  db: DB,
  args: {
    bachelierId: string;
    consultantId: string;
    typeId: string;
    slotId: string | null;
    statut: ConsultationStatut;
    prixFcfa: number;
    commissionFcfa: number;
    netConsultantFcfa: number;
    scheduledAt: string | null;
  },
): Promise<string> {
  const [row] = await db
    .insert(consultations)
    .values({
      bachelierId: args.bachelierId,
      consultantId: args.consultantId,
      typeId: args.typeId,
      slotId: args.slotId,
      statut: args.statut,
      prixFcfa: args.prixFcfa,
      commissionFcfa: args.commissionFcfa,
      netConsultantFcfa: args.netConsultantFcfa,
      scheduledAt: args.scheduledAt ? new Date(args.scheduledAt) : null,
    })
    .returning({ id: consultations.id });
  return row!.id;
}

export async function majStatut(db: DB, id: string, statut: ConsultationStatut): Promise<void> {
  await db.update(consultations).set({ statut }).where(eq(consultations.id, id));
}

export async function listPourConsultant(db: DB, consultantId: string): Promise<ConsultationRow[]> {
  return db
    .select()
    .from(consultations)
    .where(eq(consultations.consultantId, consultantId))
    .orderBy(desc(consultations.createdAt));
}

export async function listPourBachelier(db: DB, bachelierId: string): Promise<ConsultationRow[]> {
  return db
    .select()
    .from(consultations)
    .where(eq(consultations.bachelierId, bachelierId))
    .orderBy(desc(consultations.createdAt));
}
