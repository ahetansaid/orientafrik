// =====================================================================
// Route handler — génère (ou sert depuis le cache) le PDF payant.
// Flux : vérifie is_paid -> si pas de pdf_url, génère via react-pdf,
// stocke dans Supabase Storage, mémorise l'URL, renvoie le binaire.
// GET /api/plan/:id/pdf
// =====================================================================
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { PlanParcoursPDF } from '@/features/bachelier/pdf/PlanParcoursPDF';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

export const runtime = 'nodejs';          // react-pdf a besoin du runtime Node, pas Edge
export const maxDuration = 30;            // marge confortable (react-pdf ~1-2s)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. RLS fait le gardiennage : la ligne n'est lisible que par son propriétaire.
  const { data: plan, error } = await supabase
    .from('plans_parcours')
    .select('id, bachelier_id, is_paid, pdf_url, data')
    .eq('id', id)
    .single();

  if (error || !plan) return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 });

  // 2. Gating paiement : le PDF est réservé aux bacheliers ayant réglé 200 F.
  if (!plan.is_paid) {
    return NextResponse.json({ error: 'Paiement requis (200 F)' }, { status: 402 }); // Payment Required
  }

  // 3. Cache : si déjà généré, on renvoie l'URL signée (pas de re-génération).
  if (plan.pdf_url) {
    const { data: signed } = await supabase.storage
      .from('plans-pdf').createSignedUrl(plan.pdf_url, 60 * 60);
    if (signed?.signedUrl) return NextResponse.redirect(signed.signedUrl);
  }

  // 4. Génération à la volée (moteur JSX, aucun Chromium).
  const doc = plan.data as unknown as PlanParcours;
  const buffer = await renderToBuffer(<PlanParcoursPDF plan={doc} />);

  // 5. Persistance dans Storage + mémorisation de l'URL pour les prochains appels.
  const path = `${plan.bachelier_id}/${plan.id}.pdf`;
  await supabase.storage.from('plans-pdf').upload(path, buffer, {
    contentType: 'application/pdf', upsert: true,
  });
  await supabase.from('plans_parcours').update({ pdf_url: path }).eq('id', plan.id);

  // Buffer (Node) -> Uint8Array : type de corps accepté par la Web Response.
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="plan-parcours-${plan.id}.pdf"`,
    },
  });
}
