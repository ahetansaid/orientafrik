import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Compass,
  Sparkles,
  Share2,
  GraduationCap,
  School,
  Users,
  Check,
  Quote,
  Plus,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';
import { SLOGAN, TARIF_PDF_FCFA } from '@/shared/lib/constants';
import { fcfa } from '@/shared/lib/format';

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export default function LandingPage() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* blobs de fond */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
          <div className="animate-blob absolute -right-16 top-24 h-96 w-96 rounded-full bg-navy/15 blur-3xl [animation-delay:4s]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-slate-50" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur">
                <Compass className="h-3.5 w-3.5" /> Orientation post-bac · Bénin
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight text-navy sm:text-6xl">
                Trouve ta voie après le bac,{' '}
                <span className="text-gradient">sans hasard.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-lg text-lg text-slate-600">
                Réponds à quelques questions et reçois ton{' '}
                <strong className="text-navy">Plan de Parcours</strong> : 3 filières faites pour toi,
                les écoles à considérer et les bourses à viser. {SLOGAN}
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/connexion"
                  className="group inline-flex items-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-semibold text-white shadow-lg shadow-navy/20 transition hover:bg-navy/90"
                >
                  Créer mon plan gratuit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#comment"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Comment ça marche
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {['100 % gratuit pour démarrer', '3 filières sur mesure', 'Écoles & bourses'].map(
                  (t) => (
                    <li key={t} className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 text-emerald-600" /> {t}
                    </li>
                  ),
                )}
              </ul>
            </Reveal>
          </div>

          {/* visuel */}
          <Reveal delay={0.2} y={40}>
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/60 shadow-2xl shadow-navy/20 sm:aspect-[4/4]">
                <Image
                  src={px(35305047, 1000)}
                  alt="Des lycéens béninois devant leur établissement"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
              </div>
              {/* carte flottante : score */}
              <div className="animate-float absolute -bottom-5 -left-4 w-52 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-xl backdrop-blur sm:-left-8">
                <p className="text-xs font-medium text-slate-400">Ta piste n°1</p>
                <p className="mt-0.5 font-bold text-navy">Médecine</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-emerald-700">92 % compatible</p>
              </div>
              {/* pastille marque */}
              <div className="animate-float absolute -right-3 top-8 flex items-center gap-2 rounded-full bg-gold px-3 py-1.5 text-sm font-semibold text-white shadow-lg [animation-delay:1.5s]">
                <Sparkles className="h-4 w-4" /> Sur mesure
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- COMMENT ÇA MARCHE ---------- */}
      <section id="comment" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-navy sm:text-4xl">En 3 étapes, ton avenir se dessine</h2>
          <p className="mt-3 text-slate-600">
            Un moteur transparent : chaque recommandation est expliquée, jamais une boîte noire.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Compass,
              titre: 'Réponds à quelques questions',
              texte: 'Ta série, ta moyenne, tes centres d’intérêt, ton budget. 2 minutes, pas plus.',
            },
            {
              icon: Sparkles,
              titre: 'Reçois ton Plan de Parcours',
              texte: '3 filières classées par compatibilité, avec écoles et bourses adaptées à ton profil.',
            },
            {
              icon: Share2,
              titre: 'Partage, télécharge, avance',
              texte: 'Un lien à partager, un PDF détaillé, et un accompagnement si tu veux aller plus loin.',
            },
          ].map((s, i) => (
            <RevealItem key={s.titre}>
              <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-navy/20 hover:shadow-xl hover:shadow-navy/5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-white">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-gold">Étape {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-navy">{s.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.texte}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ---------- POUR QUI ---------- */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-navy sm:text-4xl">Une plateforme, trois mondes reliés</h2>
            <p className="mt-3 text-slate-600">
              Les bacheliers trouvent leur voie, les écoles rencontrent les bons profils, les
              consultants accompagnent.
            </p>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                titre: 'Bacheliers',
                texte: 'Ton plan gratuit, ton PDF détaillé, tes consultations et tes candidatures.',
                img: px(34526424, 800),
                alt: 'Étudiants qui révisent ensemble',
              },
              {
                icon: School,
                titre: 'Écoles',
                texte: 'Reçois des candidats qualifiés et suis chaque inscription de bout en bout.',
                img: px(10604063, 800),
                alt: 'Diplômés célébrant leur réussite',
              },
              {
                icon: Users,
                titre: 'Consultants',
                texte: 'Publie tes créneaux, accompagne les bacheliers, gère tes revenus.',
                img: px(34526416, 800),
                alt: 'Accompagnement en classe',
              },
            ].map((c) => (
              <RevealItem key={c.titre}>
                <div className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl hover:shadow-navy/5">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={c.img}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy shadow backdrop-blur">
                      <c.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-navy">{c.titre}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.texte}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- STATS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="grid gap-8 rounded-3xl bg-navy px-8 py-10 text-center text-white sm:grid-cols-3">
            {[
              ['8', 'filières documentées & vérifiées'],
              [fcfa(TARIF_PDF_FCFA), 'le PDF complet, 10 pages'],
              ['3', 'côtés connectés en un seul flux'],
            ].map(([big, small]) => (
              <div key={small}>
                <p className="text-4xl font-extrabold text-gold">{big}</p>
                <p className="mt-1 text-sm text-white/70">{small}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- TÉMOIGNAGES ---------- */}
      <section className="bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-navy sm:text-4xl">Ils y voient plus clair</h2>
            <p className="mt-3 text-slate-600">
              Des bacheliers qui ont transformé le doute en plan d’action.
            </p>
          </Reveal>

          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                texte:
                  'Je ne savais pas quoi faire après mon bac D. En 5 minutes, j’avais 3 pistes claires et les écoles pour chacune.',
                nom: 'Aïcha',
                role: 'Bac D · Cotonou',
              },
              {
                texte:
                  'Le PDF détaillé m’a servi à convaincre mes parents. Tout était expliqué, chiffré, sourcé.',
                nom: 'Kevin',
                role: 'Bac C · Porto-Novo',
              },
              {
                texte:
                  'La consultation a fait la différence : j’ai visé une bourse à laquelle je n’aurais jamais pensé.',
                nom: 'Fatima',
                role: 'Bac G · Parakou',
              },
            ].map((t) => (
              <RevealItem key={t.nom}>
                <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Quote className="h-7 w-7 text-gold/70" />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">
                    « {t.texte} »
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {t.nom.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy">{t.nom}</span>
                      <span className="block text-xs text-slate-500">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.1}>
            <p className="mt-6 text-center text-xs text-slate-400">
              Témoignages illustratifs — remplacés par de vrais retours au lancement.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <Reveal className="text-center">
          <h2 className="text-3xl font-bold text-navy sm:text-4xl">Questions fréquentes</h2>
        </Reveal>
        <RevealGroup className="mt-10 space-y-3">
          {[
            {
              q: 'Est-ce vraiment gratuit ?',
              r: 'Oui. Ton profil, ton Plan de Parcours et son infographie sont gratuits. Seuls le PDF détaillé (200 F) et les consultations sont payants.',
            },
            {
              q: 'Comment sont choisies mes filières ?',
              r: 'Un moteur transparent croise ta série, ta moyenne, tes centres d’intérêt et ton budget. Chaque recommandation est expliquée — jamais une boîte noire.',
            },
            {
              q: 'Mes données sont-elles partagées ?',
              r: 'Non. Quand tu partages ton plan, seuls ton prénom, tes 3 pistes et leurs scores sont visibles. Jamais ton email, ta moyenne ou ton nom complet.',
            },
            {
              q: 'Comment se passe le paiement ?',
              r: 'Par mobile money (MTN / Moov) via Fedapay. Le PDF se débloque dès la confirmation du paiement.',
            },
            {
              q: 'Je suis une école ou un consultant, comment m’inscrire ?',
              r: 'Ces accès sont activés par notre équipe (anti-fraude). Crée un compte, puis contacte-nous pour être rattaché à ton établissement.',
            },
          ].map((f) => (
            <RevealItem key={f.q}>
              <details className="group rounded-2xl border border-slate-200 bg-white p-5 transition open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-navy">
                  {f.q}
                  <Plus className="h-5 w-5 shrink-0 text-gold transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.r}</p>
              </details>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="mx-auto max-w-4xl px-4 pb-24 pt-6 text-center">
        <Reveal>
          <h2 className="text-balance text-3xl font-bold text-navy sm:text-4xl">
            Ton orientation commence maintenant.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            Gratuit, en français, pensé pour le Bénin. Crée ton Plan de Parcours en 2 minutes.
          </p>
          <Link
            href="/connexion"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-4 font-semibold text-white shadow-lg shadow-gold/25 transition hover:bg-gold/90"
          >
            Créer mon plan gratuit
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
