'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { majStatut } from '@/features/consultant/data/consultations.repo';
import type { ConsultationStatut } from '@/lib/db/enums';

// Le consultant fait avancer une consultation (terminée / annulée / no-show).
// La RLS (consult_parties_update) autorise le consultant concerné.
const AUTORISES: ConsultationStatut[] = ['completed', 'cancelled', 'no_show'];

export async function changerStatutConsultation(
  consultationId: string,
  statut: ConsultationStatut,
): Promise<ActionResult> {
  if (!AUTORISES.includes(statut)) {
    return fail('validation', 'Statut non autorisé.');
  }
  try {
    await assertRole('consultant');
    await majStatut(db, consultationId, statut);
    revalidatePath('/consultant/consultations');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Mise à jour impossible.');
  }
}
