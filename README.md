# ORIENTAFRIK

Plateforme tripartite d'orientation post-bac au Bénin : **bacheliers · écoles · consultants** (+ admin).
Un bachelier répond à quelques questions, reçoit un **Plan de Parcours** (3 filières, écoles, bourses),
peut le partager, télécharger un PDF détaillé (200 F), réserver une consultation et se faire orienter
vers une école. Les écoles suivent un funnel d'inscription (CPA) ; les consultants gèrent des créneaux ;
l'admin provisionne les rôles et le contenu.

> **Stack** : Next.js 16 (App Router · RSC · Server Actions) · **Neon** (Postgres serverless) ·
> **Drizzle ORM** · **Better Auth** (email-OTP) · **Vercel Blob** (PDF) · Fedapay (mobile money) ·
> Resend · Tailwind v4 · Vitest/Playwright · Sentry · Plausible · Vercel.

---

## Démarrage rapide

Prérequis : **Node ≥ 20** + un projet **Neon** (neon.tech).

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env.local
#   DATABASE_URL / DATABASE_URL_UNPOOLED (Neon), BETTER_AUTH_SECRET (openssl rand -base64 32),
#   NEXT_PUBLIC_SITE_URL, et (optionnels) FEDAPAY_*, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN.

# 3. Créer les tables sur Neon (applique drizzle/)
npm run drizzle:migrate

# 4. Lancer
npm run dev                   # http://localhost:3000
```

> Auth **sans service externe** : Better Auth stocke ses tables (user/session/…) dans **ta base Neon**.
> En dev sans Resend, le code OTP est loggé dans la console serveur.

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | serveur Next.js |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (0 warning toléré) |
| `npm run test:run` | tests unitaires Vitest |
| `npm run test:e2e` | Playwright |
| `npm run drizzle:generate` | génère une migration SQL depuis `src/lib/db/schema.ts` |
| `npm run drizzle:migrate` | applique les migrations `drizzle/` sur la base |
| `npm run drizzle:studio` | explorateur de données Drizzle |

---

## Architecture (feature-first)

Un dossier par domaine sous `src/features/<domaine>/`. `src/app/` reste mince et importe les features.
**Imports à sens unique** : `ui → actions → domain + data` · `data → lib/db`.

```
src/
├─ app/                         # routes (mince)
│  ├─ (marketing)/              # public : landing, /ecoles/[slug], /bourses, /p/[shareSlug] + OG
│  ├─ (auth)/                   # connexion OTP, verifier
│  ├─ (bachelier)/              # /profil, /plan/[id], /reserver, /consultations
│  ├─ (consultant)/consultant/  # tableau-de-bord, disponibilites, consultations
│  ├─ (ecole)/ecole/            # tableau-de-bord, fiche, candidatures
│  ├─ (admin)/admin/            # roles, contenu, partenariats, paiements
│  └─ api/                      # auth/[...all] (Better Auth), v1/plan/[id]/pdf, v1/webhooks/fedapay
├─ features/<domaine>/
│  ├─ domain/   # TS pur : règles, types, schémas Zod. Aucune I/O. Cible des tests unitaires.
│  ├─ data/     # *.repo.ts : SEUL endroit des requêtes DB (Drizzle, client `db` injecté).
│  ├─ actions/  # 'use server' : Zod → domain → repo → ActionResult. Pas de math métier.
│  └─ ui/       # RSC par défaut ; 'use client' si interactif. N'importe jamais data/.
├─ lib/
│  ├─ db/       # schema.ts + auth-schema.ts (Drizzle) · enums.ts · index.ts (client Neon)
│  ├─ auth.ts   # config Better Auth (email-OTP) · auth-client.ts (navigateur)
│  ├─ auth/     # session.ts + guards.ts (assertRole)
│  └─ env · email · analytics · i18n
└─ shared/      # ui (primitives), lib (result, errors, format, cn), constants
```

Conventions détaillées : [`CLAUDE.md`](./CLAUDE.md).

### Le Plan de Parcours — colonne vertébrale
Un seul objet `PlanParcours` assemblé **une fois** (scoring déterministe, transparent), rendu **deux fois** :
infographie HTML/RSC (gratuite) + PDF `@react-pdf/renderer` (payant, jamais Puppeteer).

### Partage public (croissance)
`/p/[shareSlug]` + carte Open Graph exposent **uniquement prénom + top 3 + scores** (repo `partage`
qui ne projette que ces champs). Jamais d'email/moyenne/nom complet. `share_slug` opaque.

---

## Sécurité

Voir [`SECURITY.md`](./SECURITY.md). Avec Neon + Drizzle, **il n'y a pas d'API data exposée au client**
(pas de PostgREST) : tout accès passe par le code serveur. L'autorisation est donc **côté serveur** —
défense en profondeur :

1. **proxy** (`src/proxy.ts`) — filtre grossier : session présente sur les zones protégées.
2. **`assertRole()`** dans chaque `layout.tsx` de groupe (serveur).
3. **Scoping d'appartenance** dans les repos/actions (chacun ne lit/écrit que ses lignes) ; les champs
   sensibles (paiement, rôle, commission, vérification) ne sont écrits que par des actions serveur de
   confiance (webhook Fedapay, actions admin).

Auth : **Better Auth** (email-OTP), session par cookie, tables dans Neon. Le rôle métier vit dans
`profiles` (créé à l'inscription via un hook), provisionné par l'admin (anti-fraude commission).

---

## Base de données

Source de vérité = `src/lib/db/schema.ts` (+ `auth-schema.ts` pour Better Auth). Migrations dans
`drizzle/`. Après changement de schéma : `npm run drizzle:generate` puis `npm run drizzle:migrate`.

17 tables : 13 métier (profiles, parcours, ecoles, ecole_membres, bourses, bachelier_profils,
plans_parcours, consultants, consultation_types, disponibilites, consultations, inscriptions_ecole,
payments) + 4 Better Auth (user, session, account, verification).

---

## Paiement (Fedapay)

- **Création** (action serveur) : transaction Fedapay (compte unique, pas de split en MVP) + ligne
  `payments` `pending`.
- **Webhook** [`api/v1/webhooks/fedapay`](./src/app/api/v1/webhooks/fedapay/route.ts) : signature HMAC,
  **idempotent** (index unique `fedapay_transaction_id`), bascule `is_paid` / confirme la consultation,
  reçu Resend. **Échoue fermé** si le secret est absent en production.

---

## Déploiement

Voir [`DEPLOYMENT.md`](./DEPLOYMENT.md) — **Neon** (base + `drizzle:migrate`) + **Vercel** (front,
variables d'env) + **Vercel Blob** (PDF) + **Fedapay** (webhook). Détails de la migration depuis
Supabase : [`docs/NEON_MIGRATION.md`](./docs/NEON_MIGRATION.md).

---

## État du projet

MVP fonctionnel des 4 côtés, sur **Neon + Better Auth + Drizzle + Vercel Blob**. Auth OTP testée en
réel contre Neon. Vérifié : typecheck 0, eslint 0, 27 tests unitaires, `next build` OK. Restent avant
production : clés Fedapay, E2E Playwright à réécrire pour la nouvelle stack, `BLOB_READ_WRITE_TOKEN`.
