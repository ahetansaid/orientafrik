import type { PaymentPurpose, PaymentStatut } from '@/lib/db/enums';
export type { PaymentPurpose, PaymentStatut };

// Résultat d'une création de transaction : identifiant Fedapay + URL de checkout.
export interface CheckoutFedapay {
  transactionId: string;
  checkoutUrl: string;
}

// Événement webhook Fedapay (forme réduite à ce qu'on consomme).
export interface FedapayEvent {
  name: string; // ex. 'transaction.approved'
  entity: {
    id: number | string;
    status: string; // 'approved' | 'canceled' | 'declined' | ...
    amount?: number;
  };
}

// Mappe le statut Fedapay -> notre enum payment_statut.
export function versPaymentStatut(fedapayStatus: string): PaymentStatut {
  switch (fedapayStatus) {
    case 'approved':
    case 'transferred':
      return 'succeeded';
    case 'declined':
    case 'canceled':
      return 'failed';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}
