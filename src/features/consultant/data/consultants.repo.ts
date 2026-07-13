import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';

type DB = SupabaseClient<Database>;
export type ConsultantRow = Database['public']['Tables']['consultants']['Row'];

// Consultant vérifié + nom (récupéré séparément pour éviter l'embed jsonb typé).
export interface ConsultantPublic {
  id: string;
  nom: string;
  bio: string | null;
  specialites: string[];
  photoUrl: string | null;
}

export async function listConsultantsVerifies(db: DB): Promise<ConsultantPublic[]> {
  const { data: consultants, error } = await db
    .from('consultants')
    .select('id, bio, specialites, photo_url')
    .eq('is_verified', true);
  if (error) throw new AppError('externe', 'Lecture des consultants impossible.', error);
  if (!consultants?.length) return [];

  const ids = consultants.map((c) => c.id);
  const { data: profils } = await db.from('profiles').select('id, full_name').in('id', ids);
  const nomParId = new Map((profils ?? []).map((p) => [p.id, p.full_name ?? 'Consultant']));

  return consultants.map((c) => ({
    id: c.id,
    nom: nomParId.get(c.id) ?? 'Consultant',
    bio: c.bio,
    specialites: Array.isArray(c.specialites) ? (c.specialites as string[]) : [],
    photoUrl: c.photo_url,
  }));
}

export async function getConsultant(db: DB, id: string): Promise<ConsultantRow | null> {
  const { data } = await db.from('consultants').select('*').eq('id', id).maybeSingle();
  return data ?? null;
}
