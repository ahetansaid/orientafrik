'use server';
import 'server-only';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { promouvoirSchema, rattacherSchema } from '@/features/admin/domain/admin.schema';
import {
  definirRole,
  creerConsultantSiAbsent,
  rattacherMembre,
} from '@/features/admin/data/admin.repo';

// Provisioning des rôles — RÉSERVÉ À L'ADMIN (anti-fraude commission).
// Promouvoir consultant crée aussi sa fiche (vérifiée).
export async function promouvoirRole(input: unknown): Promise<ActionResult> {
  const parsed = promouvoirSchema.safeParse(input);
  if (!parsed.success) return fail('validation', 'Requête invalide.');

  try {
    await assertRole('admin');
    await definirRole(db, parsed.data.userId, parsed.data.role);
    if (parsed.data.role === 'consultant') {
      await creerConsultantSiAbsent(db, parsed.data.userId);
    }
    revalidatePath('/admin/roles');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Changement de rôle impossible.');
  }
}

// Rattache un utilisateur à une école (staff) et lui donne le rôle 'ecole'.
export async function rattacherEcole(input: unknown): Promise<ActionResult> {
  const parsed = rattacherSchema.safeParse(input);
  if (!parsed.success) return fail('validation', 'Requête invalide.');

  try {
    await assertRole('admin');
    await definirRole(db, parsed.data.userId, 'ecole');
    await rattacherMembre(db, parsed.data.ecoleId, parsed.data.userId, parsed.data.roleEcole);
    revalidatePath('/admin/roles');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Rattachement impossible.');
  }
}
