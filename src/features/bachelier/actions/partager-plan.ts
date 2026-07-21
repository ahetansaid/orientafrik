'use server';
import 'server-only';
import { db } from '@/lib/db';
import { randomBytes } from 'node:crypto';
import { requireUser } from '@/lib/auth/guards';
import { clientEnv } from '@/lib/env';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { getPlan, definirShareSlug } from '@/features/bachelier/data/plans.repo';

// Génère (ou réutilise) le lien de partage public d'un plan. Le slug est opaque
// (anti-énumération) et distinct de l'UUID. Seul le propriétaire peut partager (RLS).
export async function partagerPlan(planId: string): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await requireUser();
    const plan = await getPlan(db, planId);
    if (!plan || plan.bachelierId !== user.id) return fail('introuvable', 'Plan introuvable.');

    const slug = plan.shareSlug ?? randomBytes(8).toString('base64url');
    const finalSlug = await definirShareSlug(db, planId, slug);

    return ok({ url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/p/${finalSlug}` });
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Partage impossible pour le moment.');
  }
}
