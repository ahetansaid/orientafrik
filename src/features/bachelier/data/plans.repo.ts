import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

type DB = SupabaseClient<Database>;
export type PlanRow = Database['public']['Tables']['plans_parcours']['Row'];

// Persiste un plan assemblé (gratuit : is_paid=false). La RLS impose
// bachelier_id = auth.uid().
export async function insererPlan(
  db: DB,
  args: { bachelierId: string; profilId: string; parcoursPrincipalId: string | null; data: PlanParcours },
): Promise<string> {
  const { data, error } = await db
    .from('plans_parcours')
    .insert({
      bachelier_id: args.bachelierId,
      profil_id: args.profilId,
      parcours_principal_id: args.parcoursPrincipalId,
      data: args.data as unknown as Json,
    })
    .select('id')
    .single();

  if (error || !data) throw new AppError('externe', 'Enregistrement du plan impossible.', error);
  return data.id;
}

// Lecture d'un plan par son id (propriétaire via RLS). null si introuvable/non autorisé.
export async function getPlan(db: DB, id: string): Promise<PlanRow | null> {
  const { data } = await db.from('plans_parcours').select('*').eq('id', id).single();
  return data ?? null;
}

// Bascule is_paid=true (appelé depuis le webhook via service_role). Idempotent.
export async function marquerPlanPaye(db: DB, planId: string): Promise<void> {
  const { error } = await db
    .from('plans_parcours')
    .update({ is_paid: true, paid_at: new Date().toISOString() })
    .eq('id', planId);
  if (error) throw new AppError('externe', 'Activation du plan payé impossible.', error);
}

// Attribue (ou renvoie) le share_slug opaque du plan. Idempotent : si déjà partagé,
// on renvoie le slug existant sans le régénérer.
export async function definirShareSlug(db: DB, planId: string, slug: string): Promise<string> {
  const existing = await getPlan(db, planId);
  if (existing?.share_slug) return existing.share_slug;

  const { data, error } = await db
    .from('plans_parcours')
    .update({ share_slug: slug, shared_at: new Date().toISOString() })
    .eq('id', planId)
    .select('share_slug')
    .single();

  if (error || !data?.share_slug) {
    throw new AppError('externe', 'Partage du plan impossible.', error);
  }
  return data.share_slug;
}
