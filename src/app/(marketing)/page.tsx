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
  Award,
  HelpCircle,
  ClipboardList,
  FileText,
  Target,
  MapPin,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from '@/shared/ui/motion/Reveal';
import { HeroBackground } from './_components/HeroBackground';

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

// Motif d'en-tête de section (pastilles or) — repère visuel récurrent.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="flex gap-1" aria-hidden>
        <span className="h-1.5 w-1.5 rounded-full bg-gold/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="h-1.5 w-1.5 rounded-full bg-gold/40" />
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{children}</span>
    </div>
  );
}

// Tuile d'accès rapide (barre de navigation intuitive façon portail).
function Tuile({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-w-[116px] flex-1 flex-col items-center gap-2 rounded-2xl px-4 py-4 text-center transition hover:bg-slate-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium leading-tight text-slate-700">{label}</span>
    </Link>
  );
}

const TUILES = [
  { href: '/connexion', icon: ClipboardList, label: 'Créer mon plan' },
  { href: '#comment', icon: Compass, label: 'Comment ça marche' },
  { href: '#plan', icon: Sparkles, label: 'Ton plan' },
  { href: '#pour-qui', icon: Users, label: 'Pour qui ?' },
  { href: '/bourses', icon: Award, label: 'Bourses' },
  { href: '#faq', icon: HelpCircle, label: 'Questions' },
];

const FILIERES = [
  'Médecine',
  'Droit',
  'Informatique',
  'Génie civil',
  'Agronomie',
  'Sciences éco',
  'Pharmacie',
  'Architecture',
  'Commerce',
  'Communication',
  'Réseaux & télécoms',
  'Sciences infirmières',
  'Comptabilité',
  'Génie électrique',
];

// Fenêtre « aperçu du Plan de Parcours » — vitrine produit (glassmorphism).
function PlanPreview() {
  const pistes = [
    { nom: 'Médecine', score: 92, ton: 'from-emerald-400 to-emerald-600' },
    { nom: 'Pharmacie', score: 84, ton: 'from-sky-400 to-sky-600' },
    { nom: 'Kinésithérapie', score: 77, ton: 'from-gold to-gold-soft' },
  ];
  return (
    <div className="relative w-full rounded-[26px] border border-white/60 bg-white/80 p-4 shadow-2xl shadow-navy/25 backdrop-blur-xl sm:p-5">
      {/* barre de fenêtre */}
      <div className="flex items-center gap-2 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[11px] font-medium text-slate-400">
          orientafrik · plan de parcours
        </span>
      </div>

      <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
            A
          </span>
          <div>
            <p className="text-sm font-bold text-navy">Plan de Aïcha</p>
            <p className="text-[11px] text-slate-400">Bac D · Cotonou · budget maîtrisé</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            <Sparkles className="h-3 w-3" /> Prêt
          </span>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Tes 3 pistes
        </p>
        <ul className="mt-2 space-y-2.5">
          {pistes.map((p, i) => (
            <li key={p.nom}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-navy">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-navy/5 text-[11px] font-bold text-navy">
                    {i + 1}
                  </span>
                  {p.nom}
                </span>
                <span className="text-xs font-bold text-slate-500">{p.score}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`animate-grow-x h-full rounded-full bg-gradient-to-r ${p.ton}`}
                  style={{ width: `${p.score}%`, animationDelay: `${0.3 + i * 0.15}s` }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <MapPin className="h-3 w-3" /> Écoles
            </p>
            <p className="mt-0.5 text-sm font-bold text-navy">6 adaptées</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-2.5">
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <Award className="h-3 w-3" /> Bourses
            </p>
            <p className="mt-0.5 text-sm font-bold text-navy">3 à viser</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* ---------- HERO (vidéo plein cadre) ---------- */}
      <section className="relative overflow-hidden text-white">
        <HeroBackground />

        <div className="mx-auto max-w-6xl px-4 pb-28 pt-20 sm:pb-32 sm:pt-28 lg:pb-40 lg:pt-36">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-gold backdrop-blur">
                <Compass className="h-3.5 w-3.5" /> Orientation post-bac · Bénin
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
                Trouve ta voie après le bac,{' '}
                <span className="bg-gradient-to-r from-gold to-amber-200 bg-clip-text text-transparent">
                  sans hasard.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                Quelques questions, et tu reçois ton{' '}
                <strong className="font-semibold text-white">Plan de Parcours</strong> : 3 filières
                faites pour toi, les écoles à considérer et les bourses à viser.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/connexion"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-white shadow-lg shadow-gold/25 transition hover:bg-gold/90"
                >
                  Créer mon plan gratuit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#comment"
                  className="inline-flex items-center gap-1.5 font-semibold text-white/90 transition hover:text-white"
                >
                  Comment ça marche
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
                {['100 % gratuit pour démarrer', 'Sans mot de passe', 'En français'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-400" /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- ACCÈS RAPIDE (tuiles, chevauchent le hero) ---------- */}
      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20">
        <Reveal>
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-navy/10 backdrop-blur">
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TUILES.map((t) => (
                <Tuile key={t.label} {...t} />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- BANDEAU FILIÈRES ---------- */}
      <section className="pb-10 pt-16">
        <Reveal className="mx-auto mb-5 max-w-6xl px-4 text-center">
          <p className="text-sm font-medium text-slate-400">
            Des filières documentées et vérifiées, du plus classique au plus recherché
          </p>
        </Reveal>
        <div className="marquee-mask relative flex overflow-hidden">
          <div className="animate-marquee flex shrink-0 gap-3 pr-3">
            {[...FILIERES, ...FILIERES].map((f, i) => (
              <span
                key={`${f}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy shadow-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COMMENT ÇA MARCHE (timeline) ---------- */}
      <section id="comment" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Simple &amp; transparent</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
            En 3 étapes, ton avenir se dessine
          </h2>
          <p className="mt-3 text-slate-600">
            Un moteur transparent : chaque recommandation est expliquée, jamais une boîte noire.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* ligne de liaison (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-navy/15 to-transparent md:block"
          />
          <RevealGroup className="grid gap-6 md:grid-cols-3">
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
                <div className="group relative h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-navy/20 hover:shadow-xl hover:shadow-navy/5">
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border-4 border-slate-50 bg-navy/5 text-navy transition group-hover:bg-navy group-hover:text-white">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="text-5xl font-black text-slate-100">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-navy">{s.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.texte}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- CE QUE CONTIENT TON PLAN ---------- */}
      <section id="plan" className="scroll-mt-20 bg-navy py-20 text-white sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <div className="flex flex-col items-start gap-2">
              <span className="flex gap-1" aria-hidden>
                <span className="h-1.5 w-1.5 rounded-full bg-gold/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <span className="h-1.5 w-1.5 rounded-full bg-gold/40" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Ta colonne vertébrale
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Ce que contient ton plan</h2>
            <p className="mt-3 max-w-md text-white/70">
              Un seul plan, pensé pour toi. Gratuit en infographie, détaillé en PDF quand tu veux
              aller plus loin.
            </p>

            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Target,
                  titre: '3 filières sur mesure',
                  texte: 'Classées par compatibilité, avec le pourquoi de chacune.',
                },
                {
                  icon: School,
                  titre: 'Écoles adaptées',
                  texte: 'Publiques et privées, filtrées selon ton profil et ton budget.',
                },
                {
                  icon: Award,
                  titre: 'Bourses à viser',
                  texte: 'Les aides auxquelles tu es réellement éligible.',
                },
                {
                  icon: FileText,
                  titre: 'PDF détaillé',
                  texte: 'Curriculum, débouchés, comparatif et sources — à garder.',
                },
              ].map((c) => (
                <RevealItem key={c.titre}>
                  <div className="h-full rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-3 font-bold">{c.titre}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{c.texte}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <Link
              href="/connexion"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3.5 font-semibold text-white shadow-lg shadow-gold/20 transition hover:bg-gold/90"
            >
              Générer mon plan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <Reveal delay={0.15} y={40}>
            <div className="relative">
              <div className="animate-blob absolute -inset-6 -z-10 rounded-full bg-gold/10 blur-3xl" />
              <PlanPreview />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- POUR QUI ---------- */}
      <section id="pour-qui" className="scroll-mt-20 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Une plateforme, trois mondes</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Reliés en un seul flux</h2>
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
                href: '/connexion',
                cta: 'Créer mon plan',
              },
              {
                icon: School,
                titre: 'Écoles',
                texte: 'Reçois des candidats qualifiés et suis chaque inscription de bout en bout.',
                img: px(10604063, 800),
                alt: 'Diplômés célébrant leur réussite',
                href: '/connexion',
                cta: 'Rejoindre',
              },
              {
                icon: Users,
                titre: 'Consultants',
                texte: 'Publie tes créneaux, accompagne les bacheliers, gère tes revenus.',
                img: px(34526416, 800),
                alt: 'Accompagnement en classe',
                href: '/connexion',
                cta: 'Devenir consultant',
              },
            ].map((c) => (
              <RevealItem key={c.titre}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-navy/20 hover:shadow-xl hover:shadow-navy/5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={c.img}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy shadow backdrop-blur">
                      <c.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-navy">{c.titre}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{c.texte}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy">
                      {c.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------- TÉMOIGNAGES ---------- */}
      <section className="bg-slate-50/70 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Ils y voient plus clair</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">
              Du doute au plan d’action
            </h2>
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
                  <div className="flex items-center justify-between">
                    <Quote className="h-7 w-7 text-gold/70" />
                    <div className="flex gap-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
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
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:py-28">
        <Reveal className="text-center">
          <Eyebrow>Bon à savoir</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold text-navy sm:text-4xl">Questions fréquentes</h2>
        </Reveal>
        <RevealGroup className="mt-10 space-y-3">
          {[
            {
              q: 'Est-ce vraiment gratuit ?',
              r: 'Oui. Ton profil, ton Plan de Parcours et son infographie sont gratuits. Seuls le PDF détaillé et les consultations sont payants.',
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
              r: 'Par mobile money (MTN / Moov) via Fedapay. Le contenu payant se débloque dès la confirmation du paiement.',
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
      <section className="relative overflow-hidden py-4">
        <div className="mx-auto max-w-5xl px-4 pb-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy to-[#0e1b3a] px-6 py-14 text-center shadow-2xl shadow-navy/25">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="animate-blob absolute -right-10 -top-10 h-56 w-56 rounded-full bg-gold/20 blur-3xl" />
                <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
              </div>
              <div className="relative">
                <h2 className="text-balance text-3xl font-bold text-white sm:text-4xl">
                  Ton orientation commence maintenant.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-white/70">
                  Gratuit, en français, pensé pour le Bénin. Crée ton Plan de Parcours en 2 minutes.
                </p>
                <Link
                  href="/connexion"
                  className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-gold px-7 py-4 font-semibold text-white shadow-lg shadow-gold/25 transition hover:bg-gold/90"
                >
                  Créer mon plan gratuit
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
