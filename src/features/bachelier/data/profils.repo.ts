import 'server-only';
import type { DB } from '@/lib/db';
import { bachelierProfils } from '@/lib/db/schema';
import { AppError } from '@/shared/lib/errors';
import type { ProfilFormValues } from '@/features/bachelier/domain/profil.schema';

// Insère le profil de profilage (B1). `scores` = {parcours_slug: score} (transparence).
export async function insererProfil(
  db: DB,
  bachelierId: string,
  v: ProfilFormValues,
  scores: Record<string, number>,
): Promise<string> {
  const [row] = await db
    .insert(bachelierProfils)
    .values({
      bachelierId,
      serieBac: v.serie,
      moyenne: String(v.moyenne),
      interets: v.interets,
      budgetAnnuelFcfa: v.budgetAnnuelFcfa,
      mobilite: v.mobilite,
      ambitionInternationale: v.ambitionInternationale,
      scores,
    })
    .returning({ id: bachelierProfils.id });
  if (!row) throw new AppError('externe', 'Enregistrement du profil impossible.');
  return row.id;
}
