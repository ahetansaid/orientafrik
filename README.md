# ORIENTAFRIK

Plateforme tripartite d'orientation post-bac au Bénin : **bacheliers · écoles · consultants** (+ admin).
Un bachelier répond à quelques questions, reçoit un **Plan de Parcours** (3 filières, écoles, bourses),
peut le partager, télécharger un PDF détaillé (200 F), réserver une consultation et se faire orienter
vers une école. Les écoles suivent un funnel d'inscription (CPA) ; les consultants gèrent des créneaux ;
l'admin provisionne les rôles et le contenu.

> **Stack** : Next.js 16 (App Router · RSC · Server Actions) · Supabase (Postgres · Auth · Storage · RLS)
> · Fedapay (mobile money) · Resend · Tailwind v4 · Vitest/Playwright · Sentry · Plausible · Vercel.

---

## Démarrage rapide

Prérequis : **Node ≥ 20**, **Docker** (pour Supabase local).

```bash
# 1. Dépendances
npm install

# 2. Base locale (Postgres + Auth + Storage) via Docker
npx supabase start            # applique migrations 0001→0011 + seed catalogue
cp .env.example .env.local     # puis colle les clés affichées par `supabase start`
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Types TypeScript générés depuis la base
npm run db:types

# 4. Lancer
npm run dev                   # http://localhost:3000
```

> **Windows** : les ports Supabase sont en **553xx** (les 543xx par défaut tombent dans une plage
> réservée par WinNAT/Hyper-V). Voir `supabase/config.toml`.

### Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | serveur Next.js |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (0 warning toléré) |
| `npm run test:run` | tests unitaires Vitest |
| `npm run test:e2e` | Playwright |
| `npm run db:reset` | recrée la base (migrations + seed) |
| `npm run db:types` | régénère `src/lib/supabase/types.ts` (ne pas éditer à la main) |

---

## Architecture (feature-first)

Un dossier par domaine sous `src/features/<domaine>/`. `src/app/` reste mince et importe les features.
**Imports à sens unique** : `ui → actions → domain + data` · `data → lib/supabase`.

```
src/
├─ app/                         # routes (mince)
│  ├─ (marketing)/              # public : landing, /ecoles/[slug], /bourses, /p/[shareSlug] + OG
│  ├─ (auth)/                   # connexion OTP, verifier, callback
│  ├─ (bachelier)/              # /profil, /plan/[id], /reserver, /consultations
│  ├─ (consultant)/consultant/  # tableau-de-bord, disponibilites, consultations
│  ├─ (ecole)/ecole/            # tableau-de-bord, fiche, candidatures
│  ├─ (admin)/admin/            # roles, contenu, partenariats, paiements
│  └─ api/v1/                   # plan/[id]/pdf, webhooks/fedapay
├─ features/<domaine>/
│  ├─ domain/   # TS pur : règles, types, schémas Zod. Aucune I/O. Cible des tests unitaires.
│  ├─ data/     # *.repo.ts : SEUL endroit des requêtes Supabase (client injecté).
│  ├─ actions/  # 'use server' : Zod → domain → repo → ActionResult. Pas de math métier.
│  └─ ui/       # RSC par défaut ; 'use client' si interactif. N'importe jamais data/.
├─ lib/         # supabase (3 clients), auth (session/guards), env (Zod), email, analytics, i18n
└─ shared/      # ui (primitives), lib (result, errors, format, cn), constants
```

Conventions détaillées et frontières d'imports : [`CLAUDE.md`](./CLAUDE.md).

### Le Plan de Parcours — colonne vertébrale
Un seul objet `PlanParcours` ([`features/bachelier/domain/plan-parcours.ts`](./src/features/bachelier/domain/plan-parcours.ts))
assemblé **une fois** (scoring déterministe, transparent), rendu **deux fois** :
- **gratuit** : infographie HTML/RSC ([`ui/InfographieParcours.tsx`](./src/features/bachelier/ui/InfographieParcours.tsx)),
- **payant** : PDF via `@react-pdf/renderer` ([`pdf/PlanParcoursPDF.tsx`](./src/features/bachelier/pdf/PlanParcoursPDF.tsx)) — jamais Puppeteer (limite bundle Vercel).

### Partage public (croissance)
`/p/[shareSlug]` + carte Open Graph exposent **uniquement prénom + top 3 + scores**, via la fonction
SQL `security definer` `get_shared_plan`. Jamais d'email/moyenne/nom complet. `share_slug` opaque,
distinct de l'UUID.

---

## Sécurité

La sécurité repose sur **trois couches** — voir [`SECURITY.md`](./SECURITY.md) pour la revue complète,
les failles trouvées/corrigées et le modèle de menace.

1. **proxy** (`src/proxy.ts`) — premier filtre grossier (préfixe → rôle). Jamais la sécurité.
2. **`assertRole()`** dans chaque `layout.tsx` de groupe (serveur).
3. **RLS Postgres + privilèges au niveau colonne** = garde ultime :
   - RLS (deny-by-default) garde les **lignes** (chacun ne voit/écrit que les siennes) ;
   - les **grants colonne** gardent les **champs** sensibles (`role`, `is_paid`, `statut`, `commission`,
     `is_verified`, `partenariat`…) : écriture réservée au `service_role` (webhook Fedapay + actions admin).

**Trois clients Supabase — ne jamais mélanger** :
- `@/lib/supabase/server` — session utilisateur, **RLS**. Défaut (RSC, actions).
- `@/lib/supabase/service` — `service_role`, **bypasse la RLS**. Webhooks + jobs admin. `server-only`.
- `@/lib/supabase/client` — navigateur, anon, RLS. Interactivité seulement.

---

## Base de données

Source de vérité = `supabase/migrations/0001…0011`. Après changement de schéma :
`npm run db:reset` puis `npm run db:types`.

| Migration | Contenu |
|---|---|
| `0001` | extensions, enums, `profiles`, helpers RLS, trigger `handle_new_user` |
| `0002`–`0006` | contenu public, bachelier, consultant, école (CPA), paiements |
| `0007` | **RLS** (deny-by-default) sur toutes les tables |
| `0008`–`0009` | seed types de consultation, bucket Storage `plans-pdf` |
| `0010` | **GRANTs** de table (sans quoi PostgREST renvoie `permission denied`) |
| `0011` | **durcissement sécurité** : privilèges au niveau colonne (anti-tampering) |

`supabase/seed.sql` : **fixtures de développement uniquement** (catalogue parcours/écoles/bourses).
Jamais appliqué en production. **Aucun compte utilisateur n'est seedé** — les comptes se créent via
l'inscription (OTP) et les rôles via l'admin.

---

## Paiement (Fedapay)

- **Création** : action serveur → transaction Fedapay (compte unique, pas de split en MVP) + ligne
  `payments` `pending` (via `service_role`).
- **Webhook** [`api/v1/webhooks/fedapay`](./src/app/api/v1/webhooks/fedapay/route.ts) : signature HMAC
  vérifiée, **idempotent** (index unique `fedapay_transaction_id`), bascule `is_paid` / confirme la
  consultation, envoie le reçu Resend. **Échoue fermé** si le secret webhook est absent en production.
- `payments` = registre de vérité ; aucune écriture applicative côté client (RLS + grants).

---

## Déploiement (cible)

Vercel (front + route handlers) + Supabase cloud. À prévoir :
- variables d'env (voir `.env.example`) — dont `SUPABASE_SERVICE_ROLE_KEY`, `FEDAPAY_*`, `RESEND_API_KEY` ;
- `supabase db push` des migrations `0001…0011` ;
- bucket Storage privé `plans-pdf` (créé par `0009`) ;
- webhook Fedapay pointé sur `/api/v1/webhooks/fedapay` avec `FEDAPAY_WEBHOOK_SECRET`.

---

## État du projet

MVP fonctionnel des 4 côtés (bachelier/consultant/école/admin), vérifié en local contre une vraie base
Supabase (funnel + isolation RLS + durcissement colonne). Restent avant production : clés Fedapay,
E2E Playwright, et le statut HTTP des liens de partage invalides (limitation Next.js documentée dans
[`SECURITY.md`](./SECURITY.md)).
