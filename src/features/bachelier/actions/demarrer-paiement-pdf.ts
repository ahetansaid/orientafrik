'use server';
import 'server-only';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth/guards';
import { clientEnv } from '@/lib/env';
import { TARIF_PDF_FCFA } from '@/shared/lib/constants';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { getPlan } from '@/features/bachelier/data/plans.repo';
import { creerCheckout } from '@/features/paiement/services/fedapay.client';
import { creerPaiement } from '@/features/paiement/data/payments.repo';

// Démarre le paiement du PDF (200 F) : checkout Fedapay + paiement `pending`.
// Le passage à is_paid se fait au webhook (idempotent).
export async function demarrerPaiementPdf(
  planId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const user = await requireUser();

    const plan = await getPlan(db, planId);
    if (!plan || plan.bachelierId !== user.id) return fail('introuvable', 'Plan introuvable.');
    if (plan.isPaid) return fail('conflit', 'Ce plan est déjà payé.');

    const checkout = await creerCheckout({
      montantFcfa: TARIF_PDF_FCFA,
      description: `PDF Plan de Parcours ${planId}`,
      callbackUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/plan/${planId}?paiement=retour`,
      email: user.email ?? undefined,
    });

    await creerPaiement(db, {
      userId: user.id,
      purpose: 'pdf_plan',
      amountFcfa: TARIF_PDF_FCFA,
      fedapayTransactionId: checkout.transactionId,
      relatedType: 'plan_parcours',
      relatedId: planId,
    });

    return ok({ checkoutUrl: checkout.checkoutUrl });
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Le paiement ne peut pas démarrer pour le moment.');
  }
}
