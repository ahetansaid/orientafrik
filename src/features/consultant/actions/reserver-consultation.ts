'use server';
import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { disponibilites } from '@/lib/db/schema';
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
// Payante -> consultation `pending` + checkout Fedapay ; la confirmation vient du
// webhook. Le prix/commission/statut sont calculés côté serveur (non falsifiables).
export async function reserverConsultation(
  input: unknown,
): Promise<ActionResult<{ checkoutUrl: string | null }>> {
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Réservation invalide.');
  }

  try {
    const user = await requireUser();

    const type = await getType(db, parsed.data.typeId);
    if (!type) return fail('introuvable', 'Type de consultation inconnu.');

    // Créneau (optionnel) : récupère l'horaire prévu.
    let scheduledAt: string | null = null;
    if (parsed.data.slotId) {
      const slot = await db.query.disponibilites.findFirst({
        where: eq(disponibilites.id, parsed.data.slotId),
        columns: { startAt: true, isBooked: true },
      });
      if (!slot) return fail('introuvable', 'Créneau introuvable.');
      if (slot.isBooked) return fail('conflit', 'Ce créneau vient d’être réservé.');
      scheduledAt = slot.startAt.toISOString();
    }

    const { prixFcfa, commissionFcfa, netConsultantFcfa } = calculerRepartition(
      type.tarifFcfa,
      type.commissionPct,
    );
    const gratuite = prixFcfa === 0;

    const consultationId = await insererConsultation(db, {
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

    if (parsed.data.slotId) await marquerReserve(db, parsed.data.slotId);

    if (gratuite) return ok({ checkoutUrl: null });

    const checkout = await creerCheckout({
      montantFcfa: prixFcfa,
      description: `Consultation ${type.libelle}`,
      callbackUrl: `${clientEnv.NEXT_PUBLIC_SITE_URL}/consultations?paiement=retour`,
      email: user.email ?? undefined,
    });
    await creerPaiement(db, {
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
