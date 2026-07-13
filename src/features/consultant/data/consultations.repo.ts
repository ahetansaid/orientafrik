import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { ConsultationStatut } from '@/lib/supabase/types';

type DB = SupabaseClient<Database>;
export type ConsultationRow = Database['public']['Tables']['consultations']['Row'];
export type ConsultationTypeRow = Database['public']['Tables']['consultation_types']['Row'];

export async function listTypes(db: DB): Promise<ConsultationTypeRow[]> {
  const { data, error } = await db
    .from('consultation_types')
    .select('*')
    .order('tarif_fcfa', { ascending: true });
  if (error) throw new AppError('externe', 'Lecture des types de consultation impossible.', error);
  return data ?? [];
}

export async function getType(db: DB, typeId: string): Promise<ConsultationTypeRow | null> {
  const { data } = await db.from('consultation_types').select('*').eq('id', typeId).maybeSingle();
  return data ?? null;
}

export async function insererConsultation(
  db: DB,
  args: {
    bachelierId: string;
    consultantId: string;
    typeId: string;
    slotId: string | null;
    statut: ConsultationStatut;
    prixFcfa: number;
    commissionFcfa: number;
    netConsultantFcfa: number;
    scheduledAt: string | null;
  },
): Promise<string> {
  const { data, error } = await db
    .from('consultations')
    .insert({
      bachelier_id: args.bachelierId,
      consultant_id: args.consultantId,
      type_id: args.typeId,
      slot_id: args.slotId,
      statut: args.statut,
      prix_fcfa: args.prixFcfa,
      commission_fcfa: args.commissionFcfa,
      net_consultant_fcfa: args.netConsultantFcfa,
      scheduled_at: args.scheduledAt,
    })
    .select('id')
    .single();
  if (error || !data) throw new AppError('externe', 'Création de la consultation impossible.', error);
  return data.id;
}

export async function majStatut(
  db: DB,
  id: string,
  statut: ConsultationStatut,
): Promise<void> {
  const { error } = await db.from('consultations').update({ statut }).eq('id', id);
  if (error) throw new AppError('externe', 'Mise à jour de la consultation impossible.', error);
}

export async function listPourConsultant(db: DB, consultantId: string): Promise<ConsultationRow[]> {
  const { data, error } = await db
    .from('consultations')
    .select('*')
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false });
  if (error) throw new AppError('externe', 'Lecture des consultations impossible.', error);
  return data ?? [];
}

export async function listPourBachelier(db: DB, bachelierId: string): Promise<ConsultationRow[]> {
  const { data, error } = await db
    .from('consultations')
    .select('*')
    .eq('bachelier_id', bachelierId)
    .order('created_at', { ascending: false });
  if (error) throw new AppError('externe', 'Lecture des consultations impossible.', error);
  return data ?? [];
}
