-- =====================================================================
-- 0010 — Privilèges de table (GRANTs)
-- Modèle Supabase : les privilèges sont permissifs, la RLS reste le garde.
-- Sans ces grants, PostgREST (rôles anon / authenticated / service_role)
-- reçoit « permission denied » AVANT même d'évaluer la RLS.
-- `service_role` bypasse la RLS ; anon/authenticated sont restreints par les
-- policies (deny-by-default) définies en 0007.
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all functions in schema public to anon, authenticated, service_role;

-- Objets créés par de futures migrations : mêmes privilèges par défaut.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
