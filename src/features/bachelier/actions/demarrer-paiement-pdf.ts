'use server';
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireUser } from '@/lib/auth/guards';
import { clientEnv } from '@/lib/env';
import { TARIF_PDF_FCFA } from '@/shared/lib/constants';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { getPlan } from '@/features/bachelier/data/plans.repo';
import { creerCheckout } from '@/features/paiement/services/fedapay.client';
import { creerPaiement } from '@/features/paiement/data/payments.repo';

// Démarre le paiement du PDF (200 F) : crée le checkout Fedapay et enregistre un
// paiement `pending`. Le passage à is_paid se fera au webhook (idempotent).
export async function demarrerPaiementPdf(
  planId: string,
): Promise<ActionResult<{ checkoutUrl: string }>> {
  try {
    const user = await requireUser();
    const supabase = await createClient();

    const plan = await getPlan(supabase, planId);
    if (!plan) return fail('introuvable', 'Plan introuvable.');
    if (plan.is_paid) return fail('conflit', 'Ce plan est déjà payé.');

    const checkout = await creerCheckout({
      montantFcfa: TARIF_PDF_FCFA,
      description: `PDF Plan de Parcours ${planId}`,
      callbackUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/plan/${planId}?paiement=retour`,
      email: user.email ?? undefined,
    });

    // Écriture payments via service_role (aucune policy insert côté user).
    const service = createServiceClient();
    await creerPaiement(service, {
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
