// =====================================================================
// NIVEAU GRATUIT — Infographie "2 pages" inline (React Server Component)
// Rendu HTML/Tailwind : instantané, léger sur 4G, partageable par capture.
// AUCUN PDF ici. C'est l'accroche de masse (100 % des bacheliers actifs).
// =====================================================================
import type { PlanParcours } from '@/features/bachelier/domain/plan-parcours';

const fcfa = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' F';

export function InfographieParcours({ plan }: { plan: PlanParcours }) {
  return (
    <article className="mx-auto max-w-2xl space-y-8 rounded-2xl bg-white p-6 text-slate-900 shadow-sm sm:p-8">
      {/* En-tête */}
      <header className="border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Ton Plan de Parcours</p>
        <h1 className="mt-1 text-2xl font-bold text-[#12224a]">
          {plan.bachelier.prenom}, voici tes 3 pistes
        </h1>
        <p className="text-sm text-slate-500">
          Bac {plan.bachelier.serie} · {plan.bachelier.moyenne}/20 · généré le {plan.genereLe}
        </p>
      </header>

      {/* Top 3 filières avec score expliqué */}
      <section className="space-y-4">
        {plan.top3.map((f, i) => (
          <div key={f.slug} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#12224a]">
                <span className="mr-2 text-amber-600">{i + 1}.</span>{f.titre}
              </h2>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {f.score}% compatible
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{f.pourquoi}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-slate-400">Durée</dt><dd className="font-medium">{f.dureeAnnees} ans</dd></div>
              <div><dt className="text-slate-400">Coût indicatif/an</dt>
                <dd className="font-medium">{fcfa(f.coutIndicatifFcfa[0])} – {fcfa(f.coutIndicatifFcfa[1])}</dd></div>
              <div className="col-span-2"><dt className="text-slate-400">Débouchés</dt>
                <dd className="font-medium">{f.debouches.join(' · ')}</dd></div>
            </dl>
          </div>
        ))}
      </section>

      {/* Écoles correspondantes (badge partenaire = transparence) */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Écoles à considérer</h3>
        <ul className="divide-y divide-slate-100">
          {plan.ecoles.map((e) => (
            <li key={e.nom} className="flex items-center justify-between py-2 text-sm">
              <span>{e.nom} <span className="text-slate-400">· {e.ville}</span>
                {e.estPartenaire && (
                  <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700">Partenaire</span>
                )}
              </span>
              <span className="font-medium tabular-nums">{fcfa(e.fraisAnnuelsFcfa[0])}+</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Bourses + prochaines étapes */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Bourses pour toi</h3>
          <ul className="space-y-1 text-sm">
            {plan.bourses.map((b) => (
              <li key={b.nom}>• <span className="font-medium">{b.nom}</span> — {b.organisme}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Tes 6 prochaines semaines</h3>
          <ul className="space-y-1 text-sm">
            {plan.calendrier.map((c) => (
              <li key={c.quand}><span className="font-medium text-[#12224a]">{c.quand} :</span> {c.action}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* CTA vers le PDF payant (200 FCFA) */}
      <footer className="rounded-xl bg-[#12224a] p-4 text-center text-white">
        <p className="text-sm">Le dossier complet — 10 pages, curriculum détaillé, comparatif écoles, témoignages —</p>
        <p className="mt-1 font-semibold">Télécharge le PDF pour 200 F</p>
      </footer>
    </article>
  );
}
