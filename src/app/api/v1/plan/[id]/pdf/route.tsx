// =====================================================================
// Route PDF payant. Garde : propriétaire + is_paid. Génère via react-pdf,
// cache dans Vercel Blob (si configuré), sert le binaire (accès contrôlé ici).
// GET /api/v1/plan/:id/pdf
// =====================================================================
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth/session';
import { getPlan, definirPdfUrl } from '@/features/bachelier/data/plans.repo';
import { PlanParcoursPDF } from '@/features/bachelier/pdf/PlanParcoursPDF';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Garde d'accès : plan existant + appartenance au demandeur.
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const plan = await getPlan(db, id);
  if (!plan || plan.bachelierId !== user.id) {
    return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 });
  }

  // 2. Gating paiement.
  if (!plan.isPaid) {
    return NextResponse.json({ error: 'Paiement requis (200 F)' }, { status: 402 });
  }

  // 3. Cache : si déjà généré, on re-sert le binaire (l'accès reste gardé ici).
  if (plan.pdfUrl) {
    const cached = await fetch(plan.pdfUrl).catch(() => null);
    if (cached?.ok) {
      return new NextResponse(cached.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="plan-parcours-${plan.id}.pdf"`,
        },
      });
    }
  }

  // 4. Génération (moteur JSX, aucun Chromium).
  const doc = plan.data as unknown as PlanParcours;
  const buffer = await renderToBuffer(<PlanParcoursPDF plan={doc} />);

  // 5. Cache Vercel Blob (si le token est configuré) + mémorisation de l'URL.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`plans/${plan.bachelierId}/${plan.id}.pdf`, buffer, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: true,
      });
      await definirPdfUrl(db, plan.id, blob.url);
    } catch {
      // cache best-effort : on sert quand même le binaire ci-dessous
    }
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plan-parcours-${plan.id}.pdf"`,
    },
  });
}
