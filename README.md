# ORIENTAFRIK

Plateforme tripartite d'orientation post-bac (Bénin) : **bacheliers / écoles / consultants + admin**.
Application Next.js 16 (App Router, RSC, Server Actions) sur Supabase (Postgres/Auth/Storage/RLS).

> **Statut** : fondation (Vague 0) posée et vérifiée — le projet compile, teste et build.
> Le cœur produit (parcours bachelier, paiement, dashboards) se construit par vagues. Voir `CLAUDE.md`.

## Démarrage

```bash
cp .env.example .env.local        # renseigner les clés Supabase
npm install
npx supabase start                # base Postgres locale (Docker) + applique migrations + seed
npm run db:types                  # (re)génère src/lib/supabase/types.ts depuis la base
npm run dev                       # http://localhost:3000
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | serveur de dev / build prod / serveur prod |
| `npm run lint` / `typecheck` | ESLint (0 warning) / `tsc --noEmit` |
| `npm run test:run` / `test:e2e` | Vitest (logique pure) / Playwright (parcours) |
| `npm run db:reset` / `db:migrate` / `db:types` | reset+seed / migrations / génération des types |

## Architecture (feature-first)

```
src/
  app/            # routes : (marketing) (auth) (bachelier) (ecole) (consultant) (admin) api/v1
  features/       # un dossier par domaine : bachelier, ecole, consultant, paiement, admin, compte
                  #   chacun : domain/ (pur+Zod) · data/ (repos) · actions/ ('use server') · ui/
  lib/            # supabase (server/client/service) · auth · analytics · env · i18n
  shared/         # ui (design system) · lib (result, errors, format, cn) · constants
supabase/migrations/   # schéma source de vérité (0001…0009) + RLS + storage
```

Conventions détaillées et frontières d'imports : **`CLAUDE.md`**.

## Décisions techniques actées

1. **PDF → `@react-pdf/renderer`** (pas Puppeteer) : Chromium ~300 Mo > limite bundle Vercel.
2. **Fedapay → compte unique, sans split** en MVP.
3. **Auth email-first** (Supabase OTP / magic link).
4. **RLS dès le schéma** : deny-by-default + helpers `security definer`.
5. **Rôles école/consultant provisionnés par l'admin** (anti-fraude commission).
6. **Partage public non-PII** : prénom + top 3 + scores via `share_slug` (fonction SQL `get_shared_plan`).

## Stack

Next.js 16 · Vercel · Supabase · Fedapay (MTN/Moov) · Resend + React Email · Tailwind v4 + shadcn/ui
· next-intl (fr, extensible UEMOA) · Sentry · Plausible + Vercel Analytics · Vitest + Playwright.
