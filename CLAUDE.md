# ORIENTAFRIK — Conventions du projet

Plateforme tripartite d'orientation post-bac (Bénin) : **bacheliers / écoles / consultants + admin**.
Next.js 16 (App Router, RSC, Server Actions) · Supabase (Postgres/Auth/Storage/RLS) · Vercel.

## Langue & unités
- **Français partout** : domaine, UI, commentaires, noms de routes.
- Montants en **FCFA entiers**. Formatage uniquement au bord via `@/shared/lib/format#fcfa`.
- Fuseau `Africa/Porto-Novo`.

## Architecture feature-first
Un dossier par domaine sous `src/features/<domaine>/`. `src/app/` reste mince et importe les features.

Anatomie d'une feature, **imports à sens unique** : `ui → actions → domain + data` · `data → lib/supabase`.
- `domain/` — TS pur (règles, types, schémas Zod `*.schema.ts`). Aucun `supabase`/`next/*`/I-O. Cible des tests unitaires.
- `data/` (`*.repo.ts`) — **seul** endroit des requêtes Supabase. Chaque fn **reçoit** un `SupabaseClient<Database>` (injecté, testable).
- `actions/` — `'use server'`. Orchestrent `Zod → domain → repo → revalidatePath → ActionResult`. Pas de math métier.
- `ui/` — RSC par défaut ; `'use client'` seulement si interactif. **Ne jamais importer `data/`** (règle ESLint).

## 3 clients Supabase — ne jamais mélanger
- `@/lib/supabase/server` — session utilisateur, **RLS** (RSC, actions). Défaut.
- `@/lib/supabase/service` — `service_role`, **bypasse la RLS**. Webhooks + jobs admin uniquement. `server-only`.
- `@/lib/supabase/client` — navigateur, anon, RLS. Interactivité seulement.

## Sécurité (double frontière)
1. `assertRole()` dans chaque `layout.tsx` de route-group (serveur).
2. **RLS Postgres** = garde ultime. Le `middleware.ts` n'est qu'un premier filtre, jamais la sécurité.
- Écriture `payments` : **jamais** de policy insert/update — passe par le webhook (`service`).
- Rôles école/consultant **provisionnés par l'admin** (anti-fraude commission). Défaut à l'inscription : `bachelier`.

## Contrats
- Server Actions renvoient `ActionResult<T>` (`@/shared/lib/result`) — **jamais** d'exception vers le client.
- Repos lèvent `AppError` (`@/shared/lib/errors`), capturée en action + Sentry.
- Env validé par Zod au boot (`@/lib/env`) : `clientEnv` (NEXT_PUBLIC_*) / `serverEnv()` (server-only).

## Plan de Parcours — colonne vertébrale
Un seul objet `PlanParcours` (`features/bachelier/domain/plan-parcours.ts`) assemblé **une fois**, rendu **deux fois** :
infographie gratuite (`ui/InfographieParcours.tsx`) + PDF payant (`pdf/PlanParcoursPDF.tsx`, `@react-pdf/renderer`, jamais Puppeteer).
Le bloc `premium` n'est assemblé qu'à la génération PDF (le `data` gratuit reste léger).

## Partage public (croissance)
`/p/[shareSlug]` + carte OG exposent **uniquement prénom + top3 + scores** via la fonction SQL `get_shared_plan`.
Jamais d'email/moyenne/nom complet. `share_slug` opaque, distinct de l'UUID.

## Base de données
Source de vérité = `supabase/migrations/0001…0009`. Après changement de schéma :
`npm run db:reset` puis `npm run db:types` (régénère `src/lib/supabase/types.ts` — ne pas l'éditer à la main).

## Commandes
`npm run dev` · `lint` · `typecheck` · `test:run` · `test:e2e` · `db:reset` · `db:types`
