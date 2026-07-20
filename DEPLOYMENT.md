# Déploiement — ORIENTAFRIK

Guide pas à pas, **de zéro**, pour mettre ORIENTAFRIK en ligne :
**Supabase cloud** (base + auth + storage) → **Fedapay sandbox** (paiement) → **Vercel** (app).

Ordre important : Supabase d'abord (fournit les clés), puis Vercel (les consomme), puis
on revient configurer les URLs de redirection et le webhook.

---

## 0. Prérequis
- Un compte **GitHub** (le dépôt : `github.com/ahetansaid/orientafrik`).
- Un compte **Supabase** (supabase.com) et un compte **Vercel** (vercel.com) — connexion via GitHub conseillée.
- Un compte **Fedapay** (fedapay.com) en mode *sandbox*.
- En local : `npm install` OK, `npx supabase --version` disponible.

---

## 1. Supabase cloud

### 1.1 Créer le projet
1. supabase.com → **New project**.
2. Région : **West EU (Ireland)** ou **Central EU (Frankfurt)** — latence correcte depuis le Bénin.
3. Note bien le **mot de passe de la base** (Database password).
4. Attends la fin du provisioning (~2 min).

### 1.2 Récupérer les clés
Project → **Settings → API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **serveur uniquement**

Settings → **Database → Connection string (URI)** → `SUPABASE_DB_URL` (remplace `[YOUR-PASSWORD]`).

### 1.3 Pousser le schéma (migrations 0001→0011)
Depuis le dépôt local :
```bash
npx supabase login                       # ouvre le navigateur
npx supabase link --project-ref <REF>    # REF = l'id du projet (dans l'URL du dashboard)
npx supabase db push                     # applique supabase/migrations/0001…0011
```
> `db push` applique les migrations **mais pas** `supabase/seed.sql` (fixtures de dev).
> Le contenu (parcours/écoles/bourses) se saisit via l'admin en prod (étape 4.3).

Vérifie : Dashboard → **Table editor** → les 13 tables sont présentes ; **Database → Policies** → RLS active.
Le bucket **`plans-pdf`** (privé) est créé par la migration `0009`.

### 1.4 Auth
Dashboard → **Authentication → URL Configuration** :
- **Site URL** : `https://<ton-domaine-vercel>.vercel.app` (tu l'auras après l'étape 3 — reviens le mettre).
- **Redirect URLs** : ajoute `https://<ton-domaine-vercel>.vercel.app/callback`.

**Authentication → Providers → Email** : garder activé (OTP / magic link). Désactiver « Confirm email »
n'est pas nécessaire (OTP confirme). Les emails partent par défaut via le mailer Supabase ; pour des
emails brandés, brancher un SMTP (Resend) plus tard.

---

## 2. Fedapay (sandbox)

1. fedapay.com → mode **Sandbox**.
2. **Paramètres → API** : récupère `Clé secrète` (`FEDAPAY_SECRET_KEY`) et `Clé publique` (`FEDAPAY_PUBLIC_KEY`).
3. **Webhooks** : crée un webhook
   - URL : `https://<ton-domaine-vercel>.vercel.app/api/v1/webhooks/fedapay` (après l'étape 3),
   - événements : `transaction.approved`, `transaction.canceled`, `transaction.declined`,
   - récupère le **secret de signature** → `FEDAPAY_WEBHOOK_SECRET`.
4. Le code cible l'API sandbox par défaut ; pour la prod, définir `FEDAPAY_LIVE=1`.

---

## 3. Vercel

### 3.1 Importer le projet
1. vercel.com → **Add New → Project** → importe `ahetansaid/orientafrik`.
2. Framework : **Next.js** (détecté). Build/install : valeurs par défaut.

### 3.2 Variables d'environnement
Project → **Settings → Environment Variables** (Production + Preview) :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (1.2) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (1.2) |
| `SUPABASE_SERVICE_ROLE_KEY` | (1.2) — secret |
| `NEXT_PUBLIC_SITE_URL` | `https://<ton-domaine>.vercel.app` |
| `FEDAPAY_SECRET_KEY` | (2) |
| `FEDAPAY_PUBLIC_KEY` | (2) |
| `FEDAPAY_WEBHOOK_SECRET` | (2) |
| `RESEND_API_KEY` | (optionnel — reçus email) |
| `TZ` | `Africa/Porto-Novo` |
| `SENTRY_DSN` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | (optionnels) |

### 3.3 Déployer
- **Deploy**. Récupère l'URL `https://<...>.vercel.app`.
- Reviens mettre cette URL dans : `NEXT_PUBLIC_SITE_URL` (Vercel), **Supabase Site/Redirect URLs** (1.4),
  et le **webhook Fedapay** (2.3), puis **redeploy**.

> **Note plan Vercel** : la route PDF déclare `maxDuration = 30`. Le plan **Hobby** limite la durée des
> fonctions ; si la génération PDF est coupée, passer en **Pro** ou réduire `maxDuration`.

---

## 4. Après le premier déploiement

### 4.1 Vérifier
- `https://<domaine>/` (landing), `/connexion` (OTP), `/manifest.webmanifest`, `/ecoles/...`.
- PWA : sur mobile Chrome, « Ajouter à l'écran d'accueil » doit apparaître (HTTPS requis — Vercel le fournit).

### 4.2 Créer le premier admin (bootstrap)
Les rôles sont **provisionnés par l'admin**, mais il n'y en a aucun au départ :
1. Inscris-toi une fois sur `/connexion` avec ton email (rôle par défaut `bachelier`).
2. Dashboard Supabase → **SQL Editor** :
   ```sql
   update public.profiles set role = 'admin' where email = 'ton.email@exemple.bj';
   ```
3. Reconnecte-toi → accès à `/admin/*`.

### 4.3 Saisir le contenu
Via `/admin/contenu` (publier parcours/écoles/bourses) et `/admin/partenariats` (commissions),
`/admin/roles` (promouvoir consultants / rattacher les écoles).

### 4.4 Tester le paiement (sandbox)
Crée un plan (bachelier) → « Télécharger le PDF » → checkout Fedapay sandbox → le webhook bascule
`is_paid` → le PDF se génère. Vérifie l'arrivée du webhook dans le dashboard Fedapay.

---

## 5. CI/CD
`.github/workflows/ci.yml` (lint · typecheck · tests · build) tourne sur chaque PR. Vercel redéploie
automatiquement à chaque push sur `main` (déploiement de production) et crée une preview par PR.

## 6. Passage en production (plus tard)
- Fedapay : compte **live** + `FEDAPAY_LIVE=1` + nouvelles clés + webhook sur le domaine final.
- Domaine personnalisé sur Vercel (+ mettre à jour Site URL Supabase, `NEXT_PUBLIC_SITE_URL`, webhook).
- SMTP Resend pour des emails d'auth brandés.
- Sauvegardes Supabase (activées par défaut selon le plan), revue `SECURITY.md`.
