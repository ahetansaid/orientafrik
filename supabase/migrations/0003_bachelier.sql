-- =====================================================================
-- 0003 — Côté bachelier (B1 Profil, B3 Plan) + partage public non-PII
-- =====================================================================

-- B1 — Résultat de profilage (déterministe, règles transparentes).
create table bachelier_profils (
  id                    uuid primary key default gen_random_uuid(),
  bachelier_id          uuid not null references profiles(id) on delete cascade,
  serie_bac             bac_serie,
  moyenne               numeric(4,2),
  interets              jsonb not null default '[]'::jsonb,
  budget_annuel_fcfa    integer,
  mobilite              mobilite not null default 'benin',
  ambition_internationale boolean not null default false,
  scores                jsonb not null default '{}'::jsonb,  -- {parcours_slug: score}
  created_at            timestamptz not null default now()
);
create index on bachelier_profils(bachelier_id);

-- B3 — Plan de Parcours assemblé pour un bachelier. Freemium :
-- `data` = infographie inline (gratuite) ; `pdf_url` généré si is_paid.
-- `share_slug` = jeton public opaque, DISTINCT de l'UUID, généré à la demande
-- de partage. Sa présence autorise l'exposition publique NON-PII (cf. get_shared_plan).
create table plans_parcours (
  id                   uuid primary key default gen_random_uuid(),
  bachelier_id         uuid not null references profiles(id) on delete cascade,
  profil_id            uuid not null references bachelier_profils(id) on delete cascade,
  parcours_principal_id uuid references parcours(id),
  data                 jsonb not null default '{}'::jsonb,   -- contenu assemblé
  is_paid              boolean not null default false,
  pdf_url              text,                                 -- Supabase Storage
  paid_at              timestamptz,
  share_slug           text unique,                          -- null tant que non partagé
  shared_at            timestamptz,
  created_at           timestamptz not null default now()
);
create index on plans_parcours(bachelier_id);

-- Lecture publique d'un plan PARTAGÉ, réduite au strict non-PII.
-- SECURITY DEFINER : contourne la RLS mais ne renvoie QUE prénom + top3 + scores.
-- Ni email, ni moyenne, ni nom complet, ni écoles/bourses. Anti-énumération : le
-- slug est opaque et l'appel échoue silencieusement (null) si le plan n'est pas partagé.
create or replace function get_shared_plan(_slug text)
  returns jsonb
  language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'prenom',   p.data->'bachelier'->>'prenom',
    'serie',    p.data->'bachelier'->>'serie',
    'genereLe', p.data->>'genereLe',
    'top3',     p.data->'top3'
  )
  from plans_parcours p
  where p.share_slug = _slug and p.share_slug is not null
  limit 1;
$$;

-- Ouvert à anon + authenticated : c'est la porte publique de la boucle de croissance.
grant execute on function get_shared_plan(text) to anon, authenticated;
