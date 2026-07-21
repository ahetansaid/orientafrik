# Déploiement — ORIENTAFRIK (Neon + Vercel)

Guide pas à pas : **Neon** (base + auth) → **Vercel Blob** (PDF) → **Fedapay** (paiement) → **Vercel** (app).

---

## 0. Prérequis
- Comptes **GitHub**, **Neon** (neon.tech), **Vercel** (vercel.com), **Fedapay** (sandbox).
- En local : `npm install` OK.

---

## 1. Neon (base de données)

### 1.1 Projet
1. neon.tech → **New project** (Postgres 16, région **EU** proche du Bénin).
2. **Connection Details** → copie :
   - chaîne **poolée** (hôte avec `-pooler`) → `DATABASE_URL`
   - chaîne **directe** (sans `-pooler`) → `DATABASE_URL_UNPOOLED`

### 1.2 Schéma
Depuis le dépôt local (avec `.env.local` renseigné) :
```bash
npm run drizzle:migrate   # crée les 17 tables sur Neon (drizzle/)
```
> Alternative CI/prod : `drizzle-kit migrate` avec `DATABASE_URL_UNPOOLED` en variable d'env.

### 1.3 Auth
Better Auth stocke ses tables (`user/session/account/verification`) **dans Neon** — déjà créées par la
migration. Aucun service d'auth externe. Génère le secret :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"  # -> BETTER_AUTH_SECRET
```

---

## 2. Vercel Blob (stockage des PDF)
Vercel → **Storage → Create Blob store** → copie le token → `BLOB_READ_WRITE_TOKEN`.
(Sans ce token, le PDF est régénéré à chaque téléchargement — l'app fonctionne quand même.)

---

## 3. Fedapay (sandbox)
1. fedapay.com (Sandbox) → **API** : `FEDAPAY_SECRET_KEY` (`sk_sandbox_…`), `FEDAPAY_PUBLIC_KEY` (`pk_sandbox_…`).
2. **Webhooks** : URL `https://<domaine-vercel>/api/v1/webhooks/fedapay`, événements
   `transaction.approved` / `canceled` / `declined` → secret → `FEDAPAY_WEBHOOK_SECRET`.
3. Prod plus tard : `FEDAPAY_LIVE=1` + clés live.

---

## 4. Vercel (application)

### 4.1 Importer
Vercel → **Add New → Project** → repo `ahetansaid/orientafrik` (framework Next.js détecté).

### 4.2 Variables d'environnement (Production + Preview)

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon (poolée) |
| `DATABASE_URL_UNPOOLED` | Neon (directe) |
| `BETTER_AUTH_SECRET` | généré (1.3) |
| `BETTER_AUTH_URL` | `https://<domaine>` |
| `NEXT_PUBLIC_SITE_URL` | `https://<domaine>` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (2) |
| `FEDAPAY_SECRET_KEY` / `FEDAPAY_PUBLIC_KEY` / `FEDAPAY_WEBHOOK_SECRET` | Fedapay (3) |
| `RESEND_API_KEY` | Resend (optionnel — OTP & reçus par email) |
| `TZ` | `Africa/Porto-Novo` |
| `SENTRY_DSN` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optionnels |

> **Emails** : sans `RESEND_API_KEY`, Better Auth ne peut pas envoyer les codes OTP en production
> (en dev ils sont loggés). Configure Resend avant l'ouverture au public.

### 4.3 Déployer
**Deploy** → récupère l'URL. Reboucle-la dans `NEXT_PUBLIC_SITE_URL` + `BETTER_AUTH_URL` (Vercel) et
l'URL du webhook Fedapay, puis **redeploy**. `vercel.json` fixe déjà la région `cdg1` (Paris).

---

## 5. Après le premier déploiement

### 5.1 Bootstrap du premier admin
Les rôles sont provisionnés par l'admin, mais il n'y en a aucun au départ :
1. Inscris-toi une fois via `/connexion` (rôle défaut `bachelier`).
2. Sur Neon (SQL Editor) :
   ```sql
   update public.profiles set role = 'admin' where email = 'ton.email@exemple.bj';
   ```
3. Reconnecte-toi → `/admin/*`. Ensuite : contenu (`/admin/contenu`), commissions
   (`/admin/partenariats`), rôles consultant/école (`/admin/roles`).

### 5.2 Smoke test
`/` (landing), `/connexion` (OTP), `/ecoles/[slug]`, création d'un plan bachelier, checkout Fedapay
sandbox → webhook → `is_paid` → PDF.

---

## 6. CI/CD
`.github/workflows/ci.yml` (lint · typecheck · tests · build). Vercel redéploie sur push `main`
(prod) + preview par PR. Pour la CI, fournir `DATABASE_URL`/`DATABASE_URL_UNPOOLED` factices n'est pas
nécessaire au build (les clients sont initialisés paresseusement), mais `BETTER_AUTH_SECRET` peut être requis.

## 7. Notes
- Migration effectuée depuis Supabase : voir [`docs/NEON_MIGRATION.md`](./docs/NEON_MIGRATION.md).
- Route PDF : `maxDuration = 30` → nécessite un plan Vercel autorisant cette durée (sinon réduire).
