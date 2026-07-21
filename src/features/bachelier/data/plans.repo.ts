import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { plansParcours } from '@/lib/db/schema';
import { AppError } from '@/shared/lib/errors';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

export type PlanRow = typeof plansParcours.$inferSelect;

export async function insererPlan(
  db: DB,
  args: {
    bachelierId: string;
    profilId: string;
    parcoursPrincipalId: string | null;
    data: PlanParcours;
  },
): Promise<string> {
  const [row] = await db
    .insert(plansParcours)
    .values({
      bachelierId: args.bachelierId,
      profilId: args.profilId,
      parcoursPrincipalId: args.parcoursPrincipalId,
      data: args.data,
    })
    .returning({ id: plansParcours.id });
  if (!row) throw new AppError('externe', 'Enregistrement du plan impossible.');
  return row.id;
}

// Lecture d'un plan par id. L'appelant vérifie l'appartenance (bachelierId).
export async function getPlan(db: DB, id: string): Promise<PlanRow | null> {
  const row = await db.query.plansParcours.findFirst({ where: eq(plansParcours.id, id) });
  return row ?? null;
}

// Bascule is_paid=true (webhook, service). Idempotent.
export async function marquerPlanPaye(db: DB, planId: string): Promise<void> {
  await db
    .update(plansParcours)
    .set({ isPaid: true, paidAt: new Date() })
    .where(eq(plansParcours.id, planId));
}

// Mémorise l'URL du PDF caché (webhook / route PDF).
export async function definirPdfUrl(db: DB, planId: string, url: string): Promise<void> {
  await db.update(plansParcours).set({ pdfUrl: url }).where(eq(plansParcours.id, planId));
}

// Attribue (ou renvoie) le share_slug. Idempotent. L'appelant a vérifié l'appartenance.
export async function definirShareSlug(db: DB, planId: string, slug: string): Promise<string> {
  const existing = await getPlan(db, planId);
  if (existing?.shareSlug) return existing.shareSlug;
  const [row] = await db
    .update(plansParcours)
    .set({ shareSlug: slug, sharedAt: new Date() })
    .where(eq(plansParcours.id, planId))
    .returning({ shareSlug: plansParcours.shareSlug });
  if (!row?.shareSlug) throw new AppError('externe', 'Partage du plan impossible.');
  return row.shareSlug;
}
