-- =====================================================================
-- 0002 — Contenu public (B2 Parcours, B4 Écoles, B5 Bourses)
-- =====================================================================

-- B2 — Catalogue des Plans de Parcours documentés (8 en MVP).
-- `contenu` = données structurées vérifiées (curriculum, débouchés, stats,
-- témoignages...). C'est LA base de faits que le moteur d'assemblage consomme.
create table parcours (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  titre        text not null,
  domaine      text not null,
  resume       text,
  contenu      jsonb not null default '{}'::jsonb,
  statut       contenu_statut not null default 'draft',
  verified_by  uuid references profiles(id),
  verified_at  timestamptz,
  updated_at   timestamptz not null default now()
);

-- B4 — Catalogue Écoles (publiques gratuites + privées partenaires CPA).
create table ecoles (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  nom                text not null,
  type               ecole_type not null,
  ville              text,
  description        text,
  logo_url           text,
  frais_min_fcfa     integer,
  frais_max_fcfa     integer,
  statut             contenu_statut not null default 'draft',
  -- Partenariat CPA (F1)
  partenariat        partenariat_statut not null default 'non_partenaire',
  commission_min_fcfa integer,
  commission_max_fcfa integer,
  plafond_mensuel_fcfa integer,          -- rassure l'école (cf. §14.5 du doc)
  badge              text,               -- 'fondateur' | 'premium' | null
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Rattachement d'un utilisateur (staff école) à une école -> dashboard B7.
create table ecole_membres (
  ecole_id   uuid not null references ecoles(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role_ecole text not null default 'staff',   -- 'admin' | 'staff'
  created_at timestamptz not null default now(),
  primary key (ecole_id, user_id)
);

-- Helper RLS dépendant de ecole_membres (défini ici, une fois la table créée).
create or replace function is_ecole_member(_ecole uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from ecole_membres where ecole_id = _ecole and user_id = auth.uid());
$$;

-- B5 — Catalogue Bourses.
create table bourses (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  organisme   text,
  pays        text,
  montant     text,
  criteres    jsonb not null default '{}'::jsonb,  -- filtrable par profil
  date_limite date,
  lien        text,
  statut      contenu_statut not null default 'draft',
  updated_at  timestamptz not null default now()
);
