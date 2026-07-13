-- =====================================================================
-- 0005 — Côté école (B7) — Funnel CPA (F1)
-- =====================================================================

-- Une ligne = un bachelier orienté vers une école, suivi jusqu'à inscription.
-- La commission n'est due qu'au statut 'inscrite' (confirmé côté école/admin).
create table inscriptions_ecole (
  id              uuid primary key default gen_random_uuid(),
  bachelier_id    uuid not null references profiles(id) on delete cascade,
  ecole_id        uuid not null references ecoles(id) on delete cascade,
  plan_id         uuid references plans_parcours(id),
  statut          inscription_statut not null default 'orientee',
  commission_fcfa integer,
  confirmed_by    uuid references profiles(id),
  orientee_at     timestamptz not null default now(),
  inscrite_at     timestamptz
);
create index on inscriptions_ecole(ecole_id);
