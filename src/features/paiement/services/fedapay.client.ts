import 'server-only';
import { serverEnv } from '@/lib/env';
import { AppError } from '@/shared/lib/errors';
import type { CheckoutFedapay } from '@/features/paiement/domain/fedapay.types';

// Client HTTP fin pour l'API Fedapay (pas de SDK -> une dépendance de moins).
// Sandbox par défaut ; passer FEDAPAY_LIVE=1 pour la production.
const BASE_URL =
  process.env.FEDAPAY_LIVE === '1'
    ? 'https://api.fedapay.com/v1'
    : 'https://sandbox-api.fedapay.com/v1';

function authHeaders() {
  const key = serverEnv().FEDAPAY_SECRET_KEY;
  if (!key) throw new AppError('externe', 'Fedapay non configuré (FEDAPAY_SECRET_KEY manquant).');
  return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

// Crée une transaction puis génère son token de paiement -> URL de checkout.
export async function creerCheckout(args: {
  montantFcfa: number;
  description: string;
  callbackUrl: string;
  email?: string;
}): Promise<CheckoutFedapay> {
  const headers = authHeaders();

  const txRes = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      description: args.description,
      amount: args.montantFcfa,
      currency: { iso: 'XOF' },
      callback_url: args.callbackUrl,
      ...(args.email ? { customer: { email: args.email } } : {}),
    }),
  });

  if (!txRes.ok) {
    throw new AppError('externe', 'Création de la transaction Fedapay échouée.', await safeBody(txRes));
  }
  const tx = (await txRes.json()) as { 'v1/transaction'?: { id: number } };
  const transactionId = tx['v1/transaction']?.id;
  if (!transactionId) throw new AppError('externe', 'Réponse Fedapay inattendue (id manquant).');

  const tokenRes = await fetch(`${BASE_URL}/transactions/${transactionId}/token`, {
    method: 'POST',
    headers,
  });
  if (!tokenRes.ok) {
    throw new AppError('externe', 'Génération du lien de paiement échouée.', await safeBody(tokenRes));
  }
  const token = (await tokenRes.json()) as { url?: string };
  if (!token.url) throw new AppError('externe', 'URL de paiement Fedapay manquante.');

  return { transactionId: String(transactionId), checkoutUrl: token.url };
}

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return { status: res.status };
  }
}
