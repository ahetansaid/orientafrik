-- =====================================================================
-- 0001 — Extensions, enums, identité & rôles
-- MVP tripartite : Bacheliers / Écoles / Consultants (+ Admin co-fondateurs)
-- Convention : snake_case, montants en FCFA (entiers), horodatage UTC.
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";     -- gen_random_uuid()

-- ---------- Enums ----------
create type user_role          as enum ('bachelier', 'ecole', 'consultant', 'admin');
create type bac_serie          as enum ('A1','A2','B','C','D','E','F','G','autre');
create type ecole_type         as enum ('publique','privee_premium','privee_moyenne','privee_accessible','internationale');
create type mobilite           as enum ('cotonou','benin','uemoa','international');
create type contenu_statut     as enum ('draft','published','archived');
create type partenariat_statut as enum ('non_partenaire','prospect','active','suspended');
create type payment_purpose    as enum ('pdf_plan','consultation');
create type payment_statut     as enum ('pending','succeeded','failed','refunded');
create type consultation_statut as enum ('pending','confirmed','completed','cancelled','no_show');
create type inscription_statut as enum ('orientee','candidature','inscrite','annulee');  -- funnel CPA (F1)

-- =====================================================================
-- Identité & rôles
-- =====================================================================

-- profiles : 1 ligne par utilisateur auth. Le rôle porte l'autorisation.
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null default 'bachelier',
  full_name   text,
  email       text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Helpers RLS en SECURITY DEFINER : lisent profiles sans déclencher la RLS
-- (évite la récursion infinie de policy). search_path figé = anti-injection.
create or replace function auth_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false);
$$;

-- NB : is_ecole_member() est défini en 0002, après la création de ecole_membres
-- (Postgres valide le corps des fonctions à la création : pas de référence en avant).

-- Création auto du profil à l'inscription (trigger sur auth.users)
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
