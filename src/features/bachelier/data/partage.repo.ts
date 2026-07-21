import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { plansParcours } from '@/lib/db/schema';
import type { PlanPartage } from '@/features/bachelier/domain/partage';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

// Vue publique NON-PII d'un plan partagé (prénom + top3 + scores). Aucune autre donnée.
export async function getPlanPartage(db: DB, slug: string): Promise<PlanPartage | null> {
  const row = await db.query.plansParcours.findFirst({
    where: eq(plansParcours.shareSlug, slug),
    columns: { data: true, shareSlug: true },
  });
  if (!row || !row.shareSlug) return null;

  const data = row.data as unknown as PlanParcours;
  const prenom = data?.bachelier?.prenom;
  if (!prenom) return null;

  return {
    prenom,
    serie: data.bachelier.serie,
    genereLe: data.genereLe,
    top3: (data.top3 ?? []).map((f) => ({
      slug: f.slug,
      titre: f.titre,
      score: f.score,
      pourquoi: f.pourquoi,
    })),
  };
}
