import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { CreneauValues } from '@/features/consultant/domain/dispo.schema';

type DB = SupabaseClient<Database>;
export type DispoRow = Database['public']['Tables']['disponibilites']['Row'];

// Créneaux futurs encore libres d'un consultant (pour la réservation).
export async function listCreneauxLibres(db: DB, consultantId: string): Promise<DispoRow[]> {
  const { data, error } = await db
    .from('disponibilites')
    .select('*')
    .eq('consultant_id', consultantId)
    .eq('is_booked', false)
    .gt('start_at', new Date().toISOString())
    .order('start_at', { ascending: true });
  if (error) throw new AppError('externe', 'Lecture des créneaux impossible.', error);
  return data ?? [];
}

export async function insererCreneaux(
  db: DB,
  consultantId: string,
  creneaux: CreneauValues[],
): Promise<void> {
  const { error } = await db.from('disponibilites').insert(
    creneaux.map((c) => ({
      consultant_id: consultantId,
      start_at: c.startAt,
      end_at: c.endAt,
    })),
  );
  if (error) throw new AppError('externe', 'Publication des créneaux impossible.', error);
}

export async function marquerReserve(db: DB, slotId: string): Promise<void> {
  const { error } = await db.from('disponibilites').update({ is_booked: true }).eq('id', slotId);
  if (error) throw new AppError('externe', 'Réservation du créneau impossible.', error);
}
