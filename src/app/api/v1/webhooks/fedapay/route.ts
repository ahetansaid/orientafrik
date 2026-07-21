// =====================================================================
// Webhook Fedapay — confirme les paiements. Idempotent (index unique
// fedapay_transaction_id). Accès DB direct (Drizzle), pas d'API publique.
// POST /api/v1/webhooks/fedapay
// =====================================================================
import { NextResponse, type NextRequest } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { serverEnv, clientEnv } from '@/lib/env';
import { getParTransaction, marquerStatut } from '@/features/paiement/data/payments.repo';
import { marquerPlanPaye } from '@/features/bachelier/data/plans.repo';
import { majStatut as majStatutConsultation } from '@/features/consultant/data/consultations.repo';
import { versPaymentStatut, type FedapayEvent } from '@/features/paiement/domain/fedapay.types';
import { getResend, EMAIL_FROM } from '@/lib/email/resend';
import { RecuPdf } from '@/lib/email/templates/RecuPdf';

export const runtime = 'nodejs';

// Signature Fedapay (schéma `t=<ts>,s=<hmac>` façon Stripe).
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

  const paiement = await getParTransaction(db, txId);
  // Transaction inconnue (ou déjà terminale) -> 200 sans effet (idempotence).
  if (!paiement || paiement.statut !== 'pending') {
    return NextResponse.json({ received: true });
  }

  const statut = versPaymentStatut(event.entity.status);
  await marquerStatut(db, txId, statut);

  if (statut === 'succeeded' && paiement.relatedId) {
    if (paiement.purpose === 'pdf_plan') {
      await marquerPlanPaye(db, paiement.relatedId);
      await envoyerRecu(paiement.userId, paiement.relatedId);
    } else if (paiement.purpose === 'consultation') {
      await majStatutConsultation(db, paiement.relatedId, 'confirmed');
    }
  }

  return NextResponse.json({ received: true });
}

// Reçu Resend (no-op si Resend non configuré).
async function envoyerRecu(userId: string, planId: string) {
  const resend = getResend();
  if (!resend) return;

  const profil = await db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
    columns: { email: true, fullName: true },
  });
  if (!profil?.email) return;

  const prenom = profil.fullName?.split(' ')[0] ?? 'à toi';
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
