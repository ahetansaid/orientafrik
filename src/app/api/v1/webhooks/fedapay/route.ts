// =====================================================================
// Webhook Fedapay — confirme les paiements. service_role (bypasse la RLS).
// Idempotent : rejoue sans effet (index unique fedapay_transaction_id).
// POST /api/v1/webhooks/fedapay
// =====================================================================
import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createServiceClient } from '@/lib/supabase/service';
import { serverEnv } from '@/lib/env';
import { clientEnv } from '@/lib/env';
import {
  getParTransaction,
  marquerStatut,
} from '@/features/paiement/data/payments.repo';
import { marquerPlanPaye } from '@/features/bachelier/data/plans.repo';
import { versPaymentStatut, type FedapayEvent } from '@/features/paiement/domain/fedapay.types';
import { getResend, EMAIL_FROM } from '@/lib/email/resend';
import { RecuPdf } from '@/lib/email/templates/RecuPdf';

export const runtime = 'nodejs';

// Vérifie la signature Fedapay (schéma `t=<ts>,s=<hmac>` façon Stripe).
function signatureValide(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')));
  const t = parts['t'];
  const s = parts['s'];
  if (!t || !s) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const secret = serverEnv().FEDAPAY_WEBHOOK_SECRET;
  const signature = req.headers.get('x-fedapay-signature');

  // En prod, une signature valide est obligatoire. En dev sans secret, on laisse passer.
  if (secret) {
    if (!signatureValide(raw, signature, secret)) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 500 });
  }

  let event: FedapayEvent;
  try {
    event = JSON.parse(raw) as FedapayEvent;
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const txId = event.entity?.id != null ? String(event.entity.id) : null;
  if (!txId) return NextResponse.json({ received: true });

  const service = createServiceClient();
  const paiement = await getParTransaction(service, txId);
  // Transaction inconnue (ou déjà à un état terminal) -> 200 sans effet (idempotence).
  if (!paiement || paiement.statut !== 'pending') {
    return NextResponse.json({ received: true });
  }

  const statut = versPaymentStatut(event.entity.status);
  await marquerStatut(service, txId, statut);

  if (statut === 'succeeded' && paiement.purpose === 'pdf_plan' && paiement.related_id) {
    await marquerPlanPaye(service, paiement.related_id);
    await envoyerRecu(service, paiement.user_id, paiement.related_id);
  }

  return NextResponse.json({ received: true });
}

// Reçu Resend (no-op si Resend non configuré).
async function envoyerRecu(
  service: ReturnType<typeof createServiceClient>,
  userId: string,
  planId: string,
) {
  const resend = getResend();
  if (!resend) return;

  const { data: profil } = await service
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .single();
  if (!profil?.email) return;

  const prenom = profil.full_name?.split(' ')[0] ?? 'à toi';
  await resend.emails.send({
    from: EMAIL_FROM,
    to: profil.email,
    subject: 'Ton Plan de Parcours est prêt',
    react: RecuPdf({
      prenom,
      lienTelechargement: `${clientEnv.NEXT_PUBLIC_SITE_URL}/api/v1/plan/${planId}/pdf`,
    }),
  });
}
