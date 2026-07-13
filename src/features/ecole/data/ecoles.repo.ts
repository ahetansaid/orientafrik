import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { FicheEcoleValues } from '@/features/ecole/domain/cpa.schema';

type DB = SupabaseClient<Database>;
export type EcoleRow = Database['public']['Tables']['ecoles']['Row'];

export async function getEcole(db: DB, id: string): Promise<EcoleRow | null> {
  const { data } = await db.from('ecoles').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}

export async function getEcoleParSlug(db: DB, slug: string): Promise<EcoleRow | null> {
  const { data } = await db.from('ecoles').select('*').eq('slug', slug).maybeSingle();
  return data ?? null;
}

export async function listEcolesPubliees(db: DB): Promise<EcoleRow[]> {
  const { data, error } = await db
    .from('ecoles')
    .select('*')
    .eq('statut', 'published')
    .order('nom', { ascending: true });
  if (error) throw new AppError('externe', 'Lecture des écoles impossible.', error);
  return data ?? [];
}

// Mise à jour de la fiche par un membre (RLS ecoles_member_update).
export async function majFiche(db: DB, id: string, v: FicheEcoleValues): Promise<void> {
  const { error } = await db
    .from('ecoles')
    .update({
      nom: v.nom,
      ville: v.ville ?? null,
      description: v.description ?? null,
      frais_min_fcfa: v.fraisMinFcfa ?? null,
      frais_max_fcfa: v.fraisMaxFcfa ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new AppError('externe', 'Mise à jour de la fiche impossible.', error);
}
