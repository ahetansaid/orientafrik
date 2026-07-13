import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { getPlanPartage } from '@/features/bachelier/data/partage.repo';
import { BRAND } from '@/shared/lib/constants';

// Carte OG dynamique (WhatsApp / réseaux) — moteur de la boucle de partage.
// Strictement non-PII : prénom + intitulés des 3 filières + scores.
export const runtime = 'nodejs';
export const alt = 'Plan de Parcours ORIENTAFRIK';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage({ params }: { params: Promise<{ shareSlug: string }> }) {
  const { shareSlug } = await params;
  const supabase = await createClient();
  const plan = await getPlanPartage(supabase, shareSlug);
  const prenom = plan?.prenom ?? 'Mon';
  const top3 = plan?.top3 ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: BRAND.navy,
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ color: BRAND.gold, fontSize: 28, letterSpacing: 4 }}>
          PLAN DE PARCOURS · ORIENTAFRIK
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12 }}>
          Les 3 pistes de {prenom}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 32, gap: 14 }}>
          {top3.slice(0, 3).map((f, i) => (
            <div key={f.slug} style={{ display: 'flex', alignItems: 'center', fontSize: 34 }}>
              <span style={{ color: BRAND.gold, marginRight: 16 }}>{i + 1}.</span>
              <span>{f.titre}</span>
              <span style={{ marginLeft: 'auto', color: '#6ee7b7' }}>{f.score}%</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
