import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserRole, ContenuStatut } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { PartenariatValues } from '@/features/admin/domain/admin.schema';

type DB = SupabaseClient<Database>;
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];

// Toutes ces opérations passent par le client RLS : la session admin satisfait
// les policies is_admin() (accès complet). Pas besoin de service_role ici.

// ---- Utilisateurs & rôles ----
export async function listProfiles(db: DB): Promise<ProfileRow[]> {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new AppError('externe', 'Lecture des utilisateurs impossible.', error);
  return data ?? [];
}

export async function definirRole(db: DB, userId: string, role: UserRole): Promise<void> {
  const { error } = await db
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new AppError('externe', 'Changement de rôle impossible.', error);
}

// Crée la ligne consultant (vérifiée) si absente — appelée à la promotion consultant.
export async function creerConsultantSiAbsent(db: DB, userId: string): Promise<void> {
  const { error } = await db
    .from('consultants')
    .upsert({ id: userId, is_verified: true }, { onConflict: 'id' });
  if (error) throw new AppError('externe', 'Création du profil consultant impossible.', error);
}

export async function rattacherMembre(
  db: DB,
  ecoleId: string,
  userId: string,
  roleEcole: string,
): Promise<void> {
  const { error } = await db
    .from('ecole_membres')
    .upsert({ ecole_id: ecoleId, user_id: userId, role_ecole: roleEcole }, { onConflict: 'ecole_id,user_id' });
  if (error) throw new AppError('externe', 'Rattachement à l’école impossible.', error);
}

// ---- Contenu (toutes lignes, tous statuts : l'admin les voit via RLS) ----
export async function listParcours(db: DB) {
  const { data, error } = await db.from('parcours').select('id, titre, slug, statut').order('titre');
  if (error) throw new AppError('externe', 'Lecture des parcours impossible.', error);
  return data ?? [];
}
export async function listEcoles(db: DB) {
  const { data, error } = await db
    .from('ecoles')
    .select('id, nom, slug, statut, partenariat, commission_min_fcfa, commission_max_fcfa')
    .order('nom');
  if (error) throw new AppError('externe', 'Lecture des écoles impossible.', error);
  return data ?? [];
}
export async function listBourses(db: DB) {
  const { data, error } = await db.from('bourses').select('id, nom, statut').order('nom');
  if (error) throw new AppError('externe', 'Lecture des bourses impossible.', error);
  return data ?? [];
}

export async function publierContenu(
  db: DB,
  type: 'parcours' | 'ecoles' | 'bourses',
  id: string,
  statut: ContenuStatut,
): Promise<void> {
  // Switch explicite : évite l'inférence d'union de `from(type)` (payload -> never).
  const q =
    type === 'parcours'
      ? db.from('parcours').update({ statut }).eq('id', id)
      : type === 'ecoles'
        ? db.from('ecoles').update({ statut }).eq('id', id)
        : db.from('bourses').update({ statut }).eq('id', id);
  const { error } = await q;
  if (error) throw new AppError('externe', 'Changement de statut impossible.', error);
}

// ---- Partenariat & commission école ----
export async function majPartenariat(db: DB, v: PartenariatValues): Promise<void> {
  const { error } = await db
    .from('ecoles')
    .update({
      partenariat: v.partenariat,
      commission_min_fcfa: v.commissionMinFcfa ?? null,
      commission_max_fcfa: v.commissionMaxFcfa ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', v.ecoleId);
  if (error) throw new AppError('externe', 'Mise à jour du partenariat impossible.', error);
}

// ---- Paiements (registre de vérité, lecture) ----
export async function listPaiements(db: DB): Promise<PaymentRow[]> {
  const { data, error } = await db
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new AppError('externe', 'Lecture des paiements impossible.', error);
  return data ?? [];
}
