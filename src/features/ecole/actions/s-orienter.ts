'use server';
import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { creerOrientation, listPourBachelier } from '@/features/ecole/data/inscriptions.repo';

// Un bachelier se déclare intéressé par une école -> entrée du funnel CPA
// (statut 'orientee'). Idempotent : une seule orientation active par école.
export async function sOrienter(ecoleId: string): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const existantes = await listPourBachelier(supabase, user.id);
    const deja = existantes.find(
      (i) => i.ecole_id === ecoleId && i.statut !== 'annulee',
    );
    if (deja) return ok(undefined);

    await creerOrientation(supabase, { bachelierId: user.id, ecoleId, planId: null });
    revalidatePath('/consultations');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Orientation impossible pour le moment.');
  }
}
