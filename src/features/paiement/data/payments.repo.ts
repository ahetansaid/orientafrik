import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import type { PaymentPurpose, PaymentStatut } from '@/features/paiement/domain/fedapay.types';

export type PaymentRow = typeof payments.$inferSelect;

// Écritures paiement : côté serveur uniquement (action de confiance / webhook).
export async function creerPaiement(
  db: DB,
  args: {
    userId: string;
    purpose: PaymentPurpose;
    amountFcfa: number;
    fedapayTransactionId: string;
    relatedType: string;
    relatedId: string;
  },
): Promise<string> {
  const [row] = await db
    .insert(payments)
    .values({
      userId: args.userId,
      purpose: args.purpose,
      amountFcfa: args.amountFcfa,
      statut: 'pending',
      fedapayTransactionId: args.fedapayTransactionId,
      relatedType: args.relatedType,
      relatedId: args.relatedId,
    })
    .returning({ id: payments.id });
  return row!.id;
}

export async function getParTransaction(db: DB, txId: string): Promise<PaymentRow | null> {
  const row = await db.query.payments.findFirst({
    where: eq(payments.fedapayTransactionId, txId),
  });
  return row ?? null;
}

export async function marquerStatut(
  db: DB,
  txId: string,
  statut: PaymentStatut,
): Promise<PaymentRow | null> {
  const [row] = await db
    .update(payments)
    .set({ statut })
    .where(eq(payments.fedapayTransactionId, txId))
    .returning();
  return row ?? null;
}
