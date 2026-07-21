'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { creerOrientation, listPourBachelier } from '@/features/ecole/data/inscriptions.repo';

// Un bachelier se déclare intéressé par une école -> entrée du funnel CPA
// (statut 'orientee'). Idempotent : une seule orientation active par école.
export async function sOrienter(ecoleId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const existantes = await listPourBachelier(db, user.id);
    const deja = existantes.find(
      (i) => i.ecoleId === ecoleId && i.statut !== 'annulee',
    );
    if (deja) return ok(undefined);

    await creerOrientation(db, { bachelierId: user.id, ecoleId, planId: null });
    revalidatePath('/consultations');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Orientation impossible pour le moment.');
  }
}
