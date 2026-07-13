import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { ProfilFormValues } from '@/features/bachelier/domain/profil.schema';

type DB = SupabaseClient<Database>;

// Insère le profil de profilage (B1). `scores` = {parcours_slug: score} pour la
// transparence. La RLS impose bachelier_id = auth.uid().
export async function insererProfil(
  db: DB,
  bachelierId: string,
  v: ProfilFormValues,
  scores: Record<string, number>,
): Promise<string> {
  const { data, error } = await db
    .from('bachelier_profils')
    .insert({
      bachelier_id: bachelierId,
      serie_bac: v.serie,
      moyenne: v.moyenne,
      interets: v.interets,
      budget_annuel_fcfa: v.budgetAnnuelFcfa,
      mobilite: v.mobilite,
      ambition_internationale: v.ambitionInternationale,
      scores,
    })
    .select('id')
    .single();

  if (error || !data) throw new AppError('externe', 'Enregistrement du profil impossible.', error);
  return data.id;
}
