import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, InscriptionStatut } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';

type DB = SupabaseClient<Database>;
export type InscriptionRow = Database['public']['Tables']['inscriptions_ecole']['Row'];

export async function listPourEcole(db: DB, ecoleId: string): Promise<InscriptionRow[]> {
  const { data, error } = await db
    .from('inscriptions_ecole')
    .select('*')
    .eq('ecole_id', ecoleId)
    .order('orientee_at', { ascending: false });
  if (error) throw new AppError('externe', 'Lecture des candidatures impossible.', error);
  return data ?? [];
}

export async function listPourBachelier(db: DB, bachelierId: string): Promise<InscriptionRow[]> {
  const { data, error } = await db
    .from('inscriptions_ecole')
    .select('*')
    .eq('bachelier_id', bachelierId)
    .order('orientee_at', { ascending: false });
  if (error) throw new AppError('externe', 'Lecture des orientations impossible.', error);
  return data ?? [];
}

export async function getInscription(db: DB, id: string): Promise<InscriptionRow | null> {
  const { data } = await db.from('inscriptions_ecole').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}

// Un bachelier s'oriente vers une école (entrée du funnel, statut 'orientee').
// RLS : le bachelier insère sa propre orientation.
export async function creerOrientation(
  db: DB,
  args: { bachelierId: string; ecoleId: string; planId: string | null },
): Promise<string> {
  const { data, error } = await db
    .from('inscriptions_ecole')
    .insert({
      bachelier_id: args.bachelierId,
      ecole_id: args.ecoleId,
      plan_id: args.planId,
      statut: 'orientee',
    })
    .select('id')
    .single();
  if (error || !data) throw new AppError('externe', 'Orientation impossible.', error);
  return data.id;
}

// Avancement du funnel par un membre école. Fixe commission + confirmed_by à l'inscription.
export async function avancerStatut(
  db: DB,
  id: string,
  statut: InscriptionStatut,
  opts: { commissionFcfa?: number | null; confirmedBy?: string } = {},
): Promise<void> {
  const patch: Database['public']['Tables']['inscriptions_ecole']['Update'] = { statut };
  if (statut === 'inscrite') {
    patch.commission_fcfa = opts.commissionFcfa ?? null;
    patch.confirmed_by = opts.confirmedBy ?? null;
    patch.inscrite_at = new Date().toISOString();
  }
  const { error } = await db.from('inscriptions_ecole').update(patch).eq('id', id);
  if (error) throw new AppError('externe', 'Avancement de la candidature impossible.', error);
}
