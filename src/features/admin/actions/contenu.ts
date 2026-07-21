'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { publierSchema, partenariatSchema } from '@/features/admin/domain/admin.schema';
import { publierContenu, majPartenariat } from '@/features/admin/data/admin.repo';

// Publication / archivage d'un contenu (parcours, école, bourse).
export async function changerStatutContenu(input: unknown): Promise<ActionResult> {
  const parsed = publierSchema.safeParse(input);
  if (!parsed.success) return fail('validation', 'Requête invalide.');

  try {
    await assertRole('admin');
    await publierContenu(db, parsed.data.type, parsed.data.id, parsed.data.statut);
    revalidatePath('/admin/contenu');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Changement de statut impossible.');
  }
}

// Configuration du partenariat CPA + commission d'une école.
export async function configurerPartenariat(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = partenariatSchema.safeParse({
    ecoleId: formData.get('ecoleId'),
    partenariat: formData.get('partenariat'),
    commissionMinFcfa: formData.get('commissionMinFcfa') || undefined,
    commissionMaxFcfa: formData.get('commissionMaxFcfa') || undefined,
  });
  if (!parsed.success) return fail('validation', parsed.error.issues[0]?.message ?? 'Requête invalide.');

  try {
    await assertRole('admin');
    await majPartenariat(db, parsed.data);
    revalidatePath('/admin/partenariats');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Mise à jour impossible.');
  }
}
