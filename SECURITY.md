# Sécurité — ORIENTAFRIK

Revue de sécurité de la plateforme, modèle de menace, failles trouvées **et corrigées**, et posture
courante. Les failles ci-dessous ont été découvertes en **testant les frontières RLS avec de vrais JWT**
contre une base Supabase locale, puis vérifiées après correction directement en Postgres
(`has_column_privilege`, `pg_policies`).

---

## 1. Modèle de sécurité (défense en profondeur)

L'application est multi-tenant (4 rôles : `bachelier`, `consultant`, `ecole`, `admin`). L'autorisation
repose sur **trois couches**, la dernière étant la seule à laquelle on fait confiance :

| Couche | Où | Rôle |
|---|---|---|
| **proxy** | `src/proxy.ts` | filtre grossier préfixe→rôle. Rafraîchit la session. **Jamais** la sécurité. |
| **`assertRole()`** | chaque `layout.tsx` de groupe | garde serveur (redirige selon le profil). |
| **RLS + privilèges colonne** | Postgres (`0007`, `0010`, `0011`) | **garde ultime**. |

### RLS = garde de LIGNE, grants colonne = garde de CHAMP
- **RLS** (deny-by-default, migration `0007`) : chaque utilisateur ne voit/écrit que **ses** lignes
  (`bachelier_id = auth.uid()`, `is_ecole_member(...)`, `is_admin()`…).
- **Privilèges au niveau colonne** (migration `0011`) : même sur ses propres lignes, l'utilisateur ne
  peut écrire que les **champs autorisés**. Les champs **sensibles** (argent, statut, rôle, vérification)
  sont écrits **uniquement par le `service_role`** (webhook Fedapay + actions admin serveur).

### Trois clients Supabase
- `@/lib/supabase/server` (RLS, session) — défaut.
- `@/lib/supabase/service` (`service_role`, bypasse la RLS) — `server-only`, webhooks + actions admin.
- `@/lib/supabase/client` (anon, RLS) — interactivité navigateur.

---

## 2. Failles trouvées et corrigées

Toutes découvertes lors de la mise en service locale ; **cause racine commune** : des policies RLS
`for all` / `for update` dont le `with check` ne validait que **l'appartenance de la ligne**, jamais
**quelles colonnes** étaient écrites — combinées à des `GRANT ALL` (migration `0010`). Un utilisateur
pouvait donc modifier des colonnes privilégiées **sur ses propres lignes**.

| # | Sévérité | Faille | Correctif |
|---|---|---|---|
| **V1** | 🔴 Critique | **Élévation de privilèges** : un utilisateur mettait `profiles.role = 'admin'` sur sa propre ligne → accès admin total. | `0011` : `revoke update on profiles`; `grant update (full_name, phone, updated_at)`. `role` réservé au trigger d'inscription et au `service_role`. |
| **V2** | 🔴 Critique | **Contournement de paiement** : un bachelier mettait `plans_parcours.is_paid = true` → PDF payant gratuit. | `0011` : `grant insert (bachelier_id, profil_id, parcours_principal_id, data)` + `grant update (share_slug, shared_at)`. `is_paid`/`pdf_url`/`paid_at` écrits par le webhook (`service_role`). |
| **V3** | 🟠 Élevée | **Fraude commission (école)** : un membre école modifiait `commission_min_fcfa` / `partenariat` de sa fiche. | `0011` : `grant update (nom, ville, description, logo_url, frais_*)` sur `ecoles`. Commission/partenariat = admin (`service_role`). |
| **V4** | 🟠 Élevée | **Auto-vérification consultant** : `consultants.is_verified = true` par soi-même. | `0011` : `grant update (bio, specialites, photo_url)`. `is_verified` = admin. |
| **V5** | 🟠 Élevée | **Consultation forgée** : insertion directe d'une consultation `statut='confirmed'`, `prix=0`. | `0011` : `revoke insert on consultations`. L'insertion passe par le `service_role` (montants calculés serveur). |
| **V6** | 🟠 Élevée | **Auto-inscription** : un bachelier se passait `statut='inscrite'` (commission indue). | `0011` : policy `inscr_bachelier_insert` (`check statut='orientee' and commission is null`) + `grant insert (bachelier_id, ecole_id, plan_id)`. |
| **B1** | 🟡 Bug | **`s-orienter` cassé** : aucune policy d'insert bachelier sur `inscriptions_ecole`. | `0011` : policy `inscr_bachelier_insert` (corrige aussi V6). |
| **B2** | 🟡 Bug | **Cache PDF cassé** : le propriétaire n'avait pas le droit d'écrire dans Storage / `pdf_url`. | Route PDF : upload Storage + update `pdf_url` via `service_role` (opération serveur de confiance après vérif du paiement). |
| **G1** | 🟢 Durcissement | **Grants trop larges** : `anon` avait `INSERT/UPDATE/DELETE` (bloqué par RLS, mais non-least-privilege). | `0011` : `anon` en **lecture seule** (revoke des écritures + default privileges). |

Failles antérieures corrigées pendant la mise en service (voir git) :
- **Bug migration** : `is_ecole_member()` référençait `ecole_membres` avant sa création (Postgres valide
  le corps des fonctions à la création) → déplacé en `0002`.
- **GRANTs absents** (`0010`) : sans eux, PostgREST renvoyait `permission denied` avant toute RLS.

### Vérification post-correctif (Postgres, source de vérité)

`has_column_privilege('authenticated', …)` — extrait :

| Test | Attendu | Obtenu |
|---|---|---|
| `profiles.role` UPDATE | `false` | ✅ `f` |
| `profiles.full_name` UPDATE | `true` | ✅ `t` |
| `plans_parcours.is_paid` UPDATE/INSERT | `false` | ✅ `f` |
| `plans_parcours.share_slug` UPDATE | `true` | ✅ `t` |
| `consultations` INSERT | `false` | ✅ `f` |
| `ecoles.commission_min_fcfa` UPDATE | `false` | ✅ `f` |
| `consultants.is_verified` UPDATE | `false` | ✅ `f` |
| `anon` INSERT (toute table) | `false` | ✅ `f` |
| `service_role` `is_paid` UPDATE | `true` | ✅ `t` |

RLS active sur **100 %** des tables `public` ; policies `inscr_bachelier_insert` et
`consult_consultant_update` présentes ; `consult_bachelier_insert` / `consult_parties_update` retirées.

---

## 3. Autres contrôles en place

- **Server Actions** : renvoient `ActionResult` (jamais d'exception vers le client) ; protection CSRF
  native Next.js (vérification d'origine).
- **Webhook Fedapay** : signature **HMAC-SHA256** vérifiée ; **idempotent** (index unique
  `fedapay_transaction_id`) ; **échoue fermé** en production si le secret est absent.
- **Montants** : toujours fixés côté serveur (tarif PDF constant ; prix/commission depuis
  `consultation_types` ; commission école depuis la fiche) — jamais issus du client.
- **Paiements** : la table `payments` n'a **aucune** policy d'écriture — seul le webhook (`service_role`)
  écrit ; le client lit les siens (`payments_read_own`).
- **Partage public** : `get_shared_plan` (`security definer`) ne renvoie que prénom + top3 + scores.
  `share_slug` opaque, distinct de l'UUID (anti-énumération). Aucune policy publique sur `plans_parcours`.
- **Open redirect** : le `callback` OAuth n'accepte que des redirections internes (`/…`, pas `//…`).
- **Secrets** : `SUPABASE_SERVICE_ROLE_KEY`, clés Fedapay/Resend — `server-only` ; env validé par Zod au
  boot (`@/lib/env`), `serverEnv()` inaccessible côté client.
- **Storage** : bucket `plans-pdf` **privé**, servi par URL signée (1 h) ; lecture RLS restreinte au
  dossier `{bachelier_id}` du propriétaire.

---

## 4. Limites connues / à traiter

- **Rate limiting** : aucun au niveau applicatif (OTP, création de paiement). À ajouter (Supabase Auth
  a ses propres limites ; prévoir un throttling sur `demarrer-paiement-*` et les webhooks).
- **Statut HTTP 404** : un lien de partage/école invalide **affiche** la page 404 mais renvoie **200**
  (limitation Next.js : shell HTML streamé avant `notFound()`). Contenu correct, en-tête imparfait (SEO).
- **OTP en dev** : Mailpit est déprécié par le CLI Supabase récent ; en dev, générer les codes via
  l'API admin (`/auth/v1/admin/generate_link`). Sans effet sur la prod (emails réels via Resend/Supabase).
- **Sentry client** : `NEXT_PUBLIC_SENTRY_DSN` non listé dans `.env.example` (le serveur utilise
  `SENTRY_DSN`). À aligner si le monitoring navigateur est activé.

---

## 5. Signaler une vulnérabilité

Contact interne Drwintech. Ne pas ouvrir d'issue publique pour une faille exploitable.
