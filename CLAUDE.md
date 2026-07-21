# ORIENTAFRIK — Conventions du projet

Plateforme tripartite d'orientation post-bac (Bénin) : **bacheliers / écoles / consultants + admin**.
Next.js 16 (App Router, RSC, Server Actions) · **Neon** (Postgres) · **Drizzle ORM** ·
**Better Auth** (email-OTP) · **Vercel Blob** · Vercel.

## Langue & unités
- **Français partout** : domaine, UI, commentaires, noms de routes.
- Montants en **FCFA entiers**. Formatage uniquement au bord via `@/shared/lib/format#fcfa`.
- Fuseau `Africa/Porto-Novo`.

## Architecture feature-first
Un dossier par domaine sous `src/features/<domaine>/`. `src/app/` reste mince et importe les features.

Anatomie d'une feature, **imports à sens unique** : `ui → actions → domain + data` · `data → lib/db`.
- `domain/` — TS pur (règles, types, schémas Zod `*.schema.ts`). Aucun accès DB/`next/*`/I-O. Cible des tests unitaires.
- `data/` (`*.repo.ts`) — **seul** endroit des requêtes DB. Chaque fn **reçoit** le client Drizzle `db` (injecté, testable).
- `actions/` — `'use server'`. Orchestrent `Zod → domain → repo → revalidatePath → ActionResult`. Pas de math métier.
- `ui/` — RSC par défaut ; `'use client'` seulement si interactif. **Ne jamais importer `data/`** (règle ESLint).

## Base & accès données (Drizzle + Neon)
- Schéma = source de vérité : `src/lib/db/schema.ts` (métier) + `src/lib/db/auth-schema.ts` (Better Auth).
- Client unique `@/lib/db#db` (Neon serverless). Les enums TS : `@/lib/db/enums`.
- **Pas d'API data exposée au client** (pas de PostgREST) : tout accès passe par le code serveur.

## Auth (Better Auth)
- Config `@/lib/auth#auth` (email-OTP, tables dans Neon). Client navigateur `@/lib/auth-client#authClient`.
- Session serveur : `@/lib/auth/session` (`getUser`/`getProfile`, en `cache()`), gardes `@/lib/auth/guards` (`assertRole`).
- `profiles` (rôle métier) créé à l'inscription via un hook Better Auth ; `profiles.id` = id utilisateur (`text`).

## Sécurité (autorisation côté serveur)
1. `proxy.ts` — filtre grossier (session présente sur zones protégées). Jamais la sécurité.
2. `assertRole()` dans chaque `layout.tsx` de route-group (serveur).
3. **Scoping d'appartenance** dans repos/actions : chacun ne lit/écrit que ses lignes.
- Champs sensibles (paiement `is_paid`, `role`, `commission`, `is_verified`, statuts) : écrits uniquement
  par des actions serveur de confiance (webhook Fedapay, actions admin). Jamais depuis une entrée client brute.
- Rôles école/consultant **provisionnés par l'admin** (anti-fraude commission). Défaut inscription : `bachelier`.

## Contrats
- Server Actions renvoient `ActionResult<T>` (`@/shared/lib/result`) — **jamais** d'exception vers le client.
- Repos lèvent `AppError` (`@/shared/lib/errors`), capturée en action + Sentry.
- Env validé par Zod au boot (`@/lib/env`) : `clientEnv` (NEXT_PUBLIC_*) / `serverEnv()` (server-only).

## Plan de Parcours — colonne vertébrale
Un seul objet `PlanParcours` (`features/bachelier/domain/plan-parcours.ts`) assemblé **une fois**, rendu **deux fois** :
infographie gratuite (`ui/InfographieParcours.tsx`) + PDF payant (`pdf/PlanParcoursPDF.tsx`, `@react-pdf/renderer`, jamais Puppeteer).

## Partage public (croissance)
`/p/[shareSlug]` expose **uniquement prénom + top3 + scores** (repo `partage` qui ne projette que ces champs).
Jamais d'email/moyenne/nom complet. `share_slug` opaque, distinct de l'id.

## Base de données
Source de vérité = `src/lib/db/schema.ts`. Après changement : `npm run drizzle:generate` puis `npm run drizzle:migrate`.

## Commandes
`npm run dev` · `lint` · `typecheck` · `test:run` · `test:e2e` · `drizzle:generate` · `drizzle:migrate`
