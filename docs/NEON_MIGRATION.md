# Migration Supabase → Neon

Branche : `migration/neon`. `main` reste sur Supabase (fonctionnel) tant que la
migration n'est pas terminée et validée.

## Pourquoi c'est une réarchitecture

Neon = Postgres serverless (la base seule). Supabase fournissait aussi l'auth, le
storage, la RLS pilotée par `auth.uid()` et l'accès data via PostgREST/`supabase-js`.
Il faut donc remplacer **4 briques** :

| Brique Supabase           | Remplacée par                                            |
| ------------------------- | -------------------------------------------------------- |
| Auth (GoTrue, OTP)        | **Better Auth** (email-OTP, tables dans Neon via Drizzle) |
| RLS via `auth.uid()`      | **Autorisation côté serveur** (voir note sécurité)       |
| Storage (bucket PDF)      | **Vercel Blob**                                          |
| PostgREST + `supabase-js` | **Drizzle ORM** + `@neondatabase/serverless`             |

> **Note sécurité — pourquoi la RLS n'est plus l'unique garde.** Avec Supabase, le
> client avait une API data publique (PostgREST) : la RLS + les GRANT colonne étaient
> indispensables. Avec Neon + Drizzle, **il n'y a plus d'API data exposée au client** —
> tout accès passe par notre code serveur (Server Actions / route handlers). La sécurité
> repose donc sur l'autorisation serveur (`assertRole` + scoping par utilisateur dans les
> repos), ce qui ferme d'office la classe d'attaques « falsification de colonne via l'API ».
> La RLS Neon (Neon Authorize) reste possible en défense en profondeur ultérieure.

## Stack cible

- **Base** : Neon (driver `@neondatabase/serverless`, HTTP/WebSocket).
- **ORM** : Drizzle (`src/lib/db/schema.ts` = source de vérité ; migrations `drizzle/`).
- **Auth** : Stack Auth (`@stackframe/stack`) — OTP/magic link e-mail, synchronisé
  dans `neon_auth.users_sync` (table gérée par Neon Auth).
- **RLS** : Neon Authorize — les policies utilisent `auth.user_id()` (jwt) et le rôle
  `authenticated`. On conserve la philosophie : RLS = garde de ligne, `GRANT` colonne
  = garde de champ (mêmes protections anti-tampering que `0011`).
- **Storage** : Vercel Blob (PDF cache), servi par la route après contrôle d'accès.

## Modèle utilisateur

- Stack Auth gère l'identité ; Neon Auth la synchronise dans `neon_auth.users_sync (id, ...)`.
- Notre table `profiles(id, role, ...)` est reliée à cet id (le `role` métier vit chez nous).
- `auth.user_id()` (Neon Authorize) = l'id Stack de l'utilisateur courant → utilisé par la RLS.

## Variables d'environnement (nouvelles)

```
DATABASE_URL=postgres://...neon.tech/...           # pooled (runtime)
DATABASE_URL_UNPOOLED=postgres://...               # direct (migrations drizzle-kit)
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=...
STACK_SECRET_SERVER_KEY=...                        # serveur uniquement
BLOB_READ_WRITE_TOKEN=...                          # Vercel Blob
# Conservées : FEDAPAY_*, RESEND_API_KEY, NEXT_PUBLIC_SITE_URL, TZ
# Supprimées : NEXT_PUBLIC_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL
```

## Phases (chaque phase commit sur la branche)

1. **Fondation** : deps, schéma Drizzle, `drizzle.config`, client DB Neon (RLS-aware). ← en cours
2. **Auth Stack** : provider, handler `/handler/[...stack]`, `lib/auth` (session/guards) réécrits.
3. **RLS** : policies Neon Authorize + `GRANT` colonne (équivalent `0007`+`0011`) en SQL Drizzle.
4. **Data** : réécriture des repos (`*.repo.ts`) en Drizzle ; actions adaptées.
5. **Storage** : route PDF via Vercel Blob.
6. **Nettoyage** : retrait `@supabase/*`, `lib/supabase/*`, migrations Supabase ; typecheck/lint/build ;
   mise à jour README/DEPLOYMENT.
7. **Déploiement** : Neon (branche prod) + `drizzle-kit push`, Stack Auth project, Vercel Blob, Vercel.

## État actuel

Phase 1 en cours. Le reste de l'app tourne encore sur Supabase pendant la bascule
(coexistence temporaire des deux stacks pour garder la branche buildable).
