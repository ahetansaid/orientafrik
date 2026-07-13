import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

type DB = SupabaseClient<Database>;

// Résout l'école rattachée à un membre staff (RLS ecole_membres_self).
// Un membre = une école en MVP.
export async function getEcoleIdPourUser(db: DB, userId: string): Promise<string | null> {
  const { data } = await db
    .from('ecole_membres')
    .select('ecole_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return data?.ecole_id ?? null;
}
