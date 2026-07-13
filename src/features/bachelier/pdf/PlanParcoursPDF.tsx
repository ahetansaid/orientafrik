// =====================================================================
// NIVEAU PAYANT — PDF 10-12 pages via @react-pdf/renderer
// Moteur JSX pur Node : PAS de Chromium, tourne dans un route handler
// Vercel sans dépasser la limite de bundle. Layout = primitives react-pdf.
// =====================================================================
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

// Police via fichier local (pas de CDN). À placer dans /public/fonts.
Font.register({
  family: 'Inter',
  fonts: [
    { src: `${process.cwd()}/public/fonts/Inter-Regular.ttf` },
    { src: `${process.cwd()}/public/fonts/Inter-Bold.ttf`, fontWeight: 700 },
  ],
});

const NAVY = '#12224a';
const GOLD = '#b8860b';
const s = StyleSheet.create({
  page: { padding: 48, fontFamily: 'Inter', fontSize: 10, color: '#1f2937', lineHeight: 1.5 },
  cover: { padding: 48, fontFamily: 'Inter', backgroundColor: NAVY, color: 'white', justifyContent: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 2, color: GOLD, textTransform: 'uppercase' },
  h1: { fontSize: 26, fontWeight: 700, marginTop: 8 },
  h2: { fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 6, marginTop: 18 },
  card: { border: '1pt solid #e5e7eb', borderRadius: 6, padding: 12, marginBottom: 10 },
  scorePill: { fontSize: 10, fontWeight: 700, color: '#047857' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  th: { fontSize: 9, color: '#6b7280', textTransform: 'uppercase', marginBottom: 2 },
  li: { marginBottom: 3 },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, fontSize: 8, color: '#9ca3af',
            borderTop: '1pt solid #e5e7eb', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
});

const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

const Footer = () => (
  <View style={s.footer} fixed>
    <Text>ORIENTAFRIK · Ton orientation post-bac, sans hasard</Text>
    <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
  </View>
);

export function PlanParcoursPDF({ plan }: { plan: PlanParcours }) {
  const p = plan.premium;
  return (
    <Document title={`Plan de Parcours — ${plan.bachelier.prenom}`} author="ORIENTAFRIK">
      {/* Page de couverture */}
      <Page size="A4" style={s.cover}>
        <Text style={s.eyebrow}>Plan de Parcours documenté</Text>
        <Text style={s.h1}>{plan.bachelier.prenom}</Text>
        <Text style={{ marginTop: 8, opacity: 0.8 }}>
          Bac {plan.bachelier.serie} · {plan.bachelier.moyenne}/20 · {plan.genereLe}
        </Text>
      </Page>

      {/* Page synthèse : top 3 filières */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Tes 3 filières recommandées</Text>
        {plan.top3.map((f, i) => (
          <View key={f.slug} style={s.card}>
            <View style={s.row}>
              <Text style={{ fontWeight: 700, color: NAVY }}>{i + 1}. {f.titre}</Text>
              <Text style={s.scorePill}>{f.score}% compatible</Text>
            </View>
            <Text style={{ marginTop: 4, color: '#4b5563' }}>{f.pourquoi}</Text>
            <View style={[s.row, { marginTop: 6 }]}>
              <Text><Text style={s.th}>Durée </Text>{f.dureeAnnees} ans</Text>
              <Text><Text style={s.th}>Coût/an </Text>{fcfa(f.coutIndicatifFcfa[0])}–{fcfa(f.coutIndicatifFcfa[1])}</Text>
            </View>
            <Text style={{ marginTop: 4 }}><Text style={s.th}>Débouchés </Text>{f.debouches.join(' · ')}</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* Pages curriculum détaillé (une section par filière) — contenu premium vérifié */}
      {p && Object.entries(p.curriculumParFiliere).map(([slug, semestres]) => (
        <Page key={slug} size="A4" style={s.page}>
          <Text style={s.h2}>Programme — {plan.top3.find((t) => t.slug === slug)?.titre}</Text>
          {semestres.map((sem, i) => (
            <Text key={i} style={s.li}>• {sem}</Text>
          ))}
          <Footer />
        </Page>
      ))}

      {/* Comparatif écoles */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Cartographie des écoles</Text>
        {(p?.comparatifEcoles ?? plan.ecoles).map((e) => (
          <View key={e.nom} style={[s.row, s.card]}>
            <View>
              <Text style={{ fontWeight: 700 }}>{e.nom} {e.estPartenaire ? '· Partenaire' : ''}</Text>
              <Text style={{ color: '#6b7280' }}>{e.ville} · {e.type}</Text>
            </View>
            <Text>{fcfa(e.fraisAnnuelsFcfa[0])}–{fcfa(e.fraisAnnuelsFcfa[1])}/an</Text>
          </View>
        ))}
        <Footer />
      </Page>

      {/* Bourses + calendrier + témoignages + sources */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Bourses applicables</Text>
        {plan.bourses.map((b) => (
          <Text key={b.nom} style={s.li}>• {b.nom} — {b.organisme}{b.dateLimite ? ` (limite ${b.dateLimite})` : ''}</Text>
        ))}
        <Text style={s.h2}>Ton calendrier des démarches</Text>
        {plan.calendrier.map((c) => (
          <Text key={c.quand} style={s.li}><Text style={{ fontWeight: 700 }}>{c.quand} : </Text>{c.action}</Text>
        ))}
        {p?.temoignages?.length ? (
          <>
            <Text style={s.h2}>Témoignages d'anciens</Text>
            {p.temoignages.map((t, i) => (
              <Text key={i} style={[s.li, { fontStyle: 'italic', color: '#4b5563' }]}>« {t.texte} » — {t.auteur}</Text>
            ))}
          </>
        ) : null}
        {p?.sources?.length ? (
          <>
            <Text style={[s.h2, { fontSize: 11 }]}>Sources</Text>
            {p.sources.map((src, i) => <Text key={i} style={{ fontSize: 8, color: '#9ca3af' }}>{src}</Text>)}
          </>
        ) : null}
        <Footer />
      </Page>
    </Document>
  );
}
