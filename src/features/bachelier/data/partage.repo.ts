import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { PlanPartage } from '@/features/bachelier/domain/partage';

type DB = SupabaseClient<Database>;

// Lecture publique NON-PII d'un plan partagé via la fonction SQL security definer.
// Renvoie null si le slug n'existe pas / le plan n'est pas partagé.
export async function getPlanPartage(db: DB, slug: string): Promise<PlanPartage | null> {
  const { data, error } = await db.rpc('get_shared_plan', { _slug: slug });
  if (error || !data) return null;
  const p = data as unknown as PlanPartage | null;
  return p && p.prenom ? p : null;
}
