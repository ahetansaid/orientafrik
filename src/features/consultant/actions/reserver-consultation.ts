'use server';
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { requireUser } from '@/lib/auth/guards';
import { clientEnv } from '@/lib/env';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { reservationSchema } from '@/features/consultant/domain/dispo.schema';
import { calculerRepartition } from '@/features/consultant/domain/commission';
import { getType, insererConsultation } from '@/features/consultant/data/consultations.repo';
import { marquerReserve } from '@/features/consultant/data/disponibilites.repo';
import { creerCheckout } from '@/features/paiement/services/fedapay.client';
import { creerPaiement } from '@/features/paiement/data/payments.repo';

// Un bachelier réserve une consultation. Gratuite (n1) -> confirmée directement.
// Payante -> consultation `pending` + checkout Fedapay ; la confirmation viendra
// du webhook. Le créneau est marqué réservé dès la demande (via service_role,
// la RLS des créneaux étant réservée au consultant).
export async function reserverConsultation(
  input: unknown,
): Promise<ActionResult<{ checkoutUrl: string | null }>> {
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Réservation invalide.');
  }

  try {
    const user = await requireUser();
    const supabase = await createClient();
    const service = createServiceClient();

    const type = await getType(supabase, parsed.data.typeId);
    if (!type) return fail('introuvable', 'Type de consultation inconnu.');

    // Créneau (optionnel) : récupère l'horaire prévu.
    let scheduledAt: string | null = null;
    if (parsed.data.slotId) {
      const { data: slot } = await supabase
        .from('disponibilites')
        .select('start_at, is_booked')
        .eq('id', parsed.data.slotId)
        .maybeSingle();
      if (!slot) return fail('introuvable', 'Créneau introuvable.');
      if (slot.is_booked) return fail('conflit', 'Ce créneau vient d’être réservé.');
      scheduledAt = slot.start_at;
    }

    const { prixFcfa, commissionFcfa, netConsultantFcfa } = calculerRepartition(
      type.tarif_fcfa,
      type.commission_pct,
    );
    const gratuite = prixFcfa === 0;

    const consultationId = await insererConsultation(supabase, {
      bachelierId: user.id,
      consultantId: parsed.data.consultantId,
      typeId: parsed.data.typeId,
      slotId: parsed.data.slotId ?? null,
      statut: gratuite ? 'confirmed' : 'pending',
      prixFcfa,
      commissionFcfa,
      netConsultantFcfa,
      scheduledAt,
    });

    if (parsed.data.slotId) await marquerReserve(service, parsed.data.slotId);

    if (gratuite) return ok({ checkoutUrl: null });

    const checkout = await creerCheckout({
      montantFcfa: prixFcfa,
      description: `Consultation ${type.libelle}`,
      callbackUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/consultations?paiement=retour`,
      email: user.email ?? undefined,
    });
    await creerPaiement(service, {
      userId: user.id,
      purpose: 'consultation',
      amountFcfa: prixFcfa,
      fedapayTransactionId: checkout.transactionId,
      relatedType: 'consultation',
      relatedId: consultationId,
    });

    return ok({ checkoutUrl: checkout.checkoutUrl });
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Réservation impossible pour le moment.');
  }
}
