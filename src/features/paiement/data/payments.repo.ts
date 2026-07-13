import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type { PaymentPurpose, PaymentStatut } from '@/features/paiement/domain/fedapay.types';

type DB = SupabaseClient<Database>;
export type PaymentRow = Database['public']['Tables']['payments']['Row'];

// La table payments n'a AUCUNE policy insert/update (deny-by-default) : toutes
// ces écritures doivent passer par le client service_role (action serveur de
// confiance ou webhook). La lecture, elle, passe par le client RLS (payments_read_own).

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
  const { data, error } = await db
    .from('payments')
    .insert({
      user_id: args.userId,
      purpose: args.purpose,
      amount_fcfa: args.amountFcfa,
      statut: 'pending',
      fedapay_transaction_id: args.fedapayTransactionId,
      related_type: args.relatedType,
      related_id: args.relatedId,
    })
    .select('id')
    .single();

  if (error || !data) throw new AppError('externe', 'Création du paiement impossible.', error);
  return data.id;
}

// Idempotence : retrouve un paiement par sa transaction Fedapay (index unique).
export async function getParTransaction(db: DB, txId: string): Promise<PaymentRow | null> {
  const { data } = await db
    .from('payments')
    .select('*')
    .eq('fedapay_transaction_id', txId)
    .maybeSingle();
  return data ?? null;
}

export async function marquerStatut(
  db: DB,
  txId: string,
  statut: PaymentStatut,
): Promise<PaymentRow | null> {
  const { data, error } = await db
    .from('payments')
    .update({ statut })
    .eq('fedapay_transaction_id', txId)
    .select('*')
    .maybeSingle();
  if (error) throw new AppError('externe', 'Mise à jour du paiement impossible.', error);
  return data ?? null;
}
