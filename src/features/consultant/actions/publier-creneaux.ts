'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { creneauSchema } from '@/features/consultant/domain/dispo.schema';
import { insererCreneaux } from '@/features/consultant/data/disponibilites.repo';

// Un consultant publie un créneau de disponibilité. La RLS impose
// consultant_id = auth.uid().
export async function publierCreneau(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = creneauSchema.safeParse({
    startAt: formData.get('startAt'),
    endAt: formData.get('endAt'),
  });
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Créneau invalide.');
  }

  try {
    const profil = await assertRole('consultant');
    await insererCreneaux(db, profil.id, [parsed.data]);
    revalidatePath('/consultant/disponibilites');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Publication impossible pour le moment.');
  }
}
