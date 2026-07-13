-- =====================================================================
-- 0004 — Côté consultant (B6 Réservation, B8 Dashboard)
-- =====================================================================

create table consultants (
  id           uuid primary key references profiles(id) on delete cascade,
  bio          text,
  specialites  jsonb not null default '[]'::jsonb,
  is_verified  boolean not null default false,
  photo_url    text,
  created_at   timestamptz not null default now()
);

-- Types de consultation (niveau 1 gratuit .. pack international). Config globale.
create table consultation_types (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,       -- 'n1','n2','n3','pack_bourse','pack_intl'
  libelle        text not null,
  duree_min      integer not null,
  tarif_fcfa     integer not null default 0,
  commission_pct integer not null default 20
);

-- Créneaux de disponibilité proposés par un consultant.
create table disponibilites (
  id           uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants(id) on delete cascade,
  start_at     timestamptz not null,
  end_at       timestamptz not null,
  is_booked    boolean not null default false
);
create index on disponibilites(consultant_id, start_at);

-- Réservations / consultations.
create table consultations (
  id                uuid primary key default gen_random_uuid(),
  bachelier_id      uuid not null references profiles(id) on delete cascade,
  consultant_id     uuid not null references consultants(id),
  type_id           uuid not null references consultation_types(id),
  slot_id           uuid references disponibilites(id),
  statut            consultation_statut not null default 'pending',
  prix_fcfa         integer not null default 0,
  commission_fcfa   integer not null default 0,
  net_consultant_fcfa integer not null default 0,
  scheduled_at      timestamptz,
  notes             text,
  created_at        timestamptz not null default now()
);
create index on consultations(consultant_id);
create index on consultations(bachelier_id);
