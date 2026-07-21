'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { ficheEcoleSchema } from '@/features/ecole/domain/cpa.schema';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { majFiche } from '@/features/ecole/data/ecoles.repo';

export async function majFicheEcole(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = ficheEcoleSchema.safeParse({
    nom: formData.get('nom'),
    ville: formData.get('ville') || undefined,
    description: formData.get('description') || undefined,
    fraisMinFcfa: formData.get('fraisMinFcfa') || undefined,
    fraisMaxFcfa: formData.get('fraisMaxFcfa') || undefined,
  });
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Fiche invalide.');
  }

  try {
    const profil = await assertRole('ecole');
    const ecoleId = await getEcoleIdPourUser(db, profil.id);
    if (!ecoleId) return fail('non_autorise', 'Aucune école rattachée à ton compte.');

    await majFiche(db, ecoleId, parsed.data);
    revalidatePath('/ecole/fiche');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Mise à jour impossible pour le moment.');
  }
}
