-- =====================================================================
-- 0007 — Row Level Security
-- Principe : deny-by-default. On active la RLS partout, puis on ouvre au strict.
-- =====================================================================

alter table profiles           enable row level security;
alter table parcours           enable row level security;
alter table ecoles             enable row level security;
alter table ecole_membres      enable row level security;
alter table bourses            enable row level security;
alter table bachelier_profils  enable row level security;
alter table plans_parcours     enable row level security;
alter table consultants        enable row level security;
alter table consultation_types enable row level security;
alter table disponibilites     enable row level security;
alter table consultations      enable row level security;
alter table inscriptions_ecole enable row level security;
alter table payments           enable row level security;

-- ---- profiles : chacun le sien ; admin voit tout ----
create policy profiles_select_own on profiles for select
  using (id = auth.uid() or is_admin());
create policy profiles_update_own on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_all on profiles for all
  using (is_admin()) with check (is_admin());

-- ---- Contenu public : lecture publique du 'published', écriture admin ----
create policy parcours_read_published on parcours for select
  using (statut = 'published' or is_admin());
create policy parcours_admin_write on parcours for all
  using (is_admin()) with check (is_admin());

create policy bourses_read_published on bourses for select
  using (statut = 'published' or is_admin());
create policy bourses_admin_write on bourses for all
  using (is_admin()) with check (is_admin());

create policy ctype_read_all on consultation_types for select using (true);
create policy ctype_admin_write on consultation_types for all
  using (is_admin()) with check (is_admin());

-- ---- Écoles : public voit 'published' ; un membre voit SA fiche complète ----
create policy ecoles_read_published on ecoles for select
  using (statut = 'published' or is_ecole_member(id) or is_admin());
create policy ecoles_member_update on ecoles for update
  using (is_ecole_member(id)) with check (is_ecole_member(id));
create policy ecoles_admin_write on ecoles for all
  using (is_admin()) with check (is_admin());

create policy ecole_membres_self on ecole_membres for select
  using (user_id = auth.uid() or is_admin());
create policy ecole_membres_admin on ecole_membres for all
  using (is_admin()) with check (is_admin());

-- ---- Bachelier : profils & plans strictement personnels ----
create policy profils_owner on bachelier_profils for all
  using (bachelier_id = auth.uid() or is_admin())
  with check (bachelier_id = auth.uid());

create policy plans_owner_rw on plans_parcours for all
  using (bachelier_id = auth.uid() or is_admin())
  with check (bachelier_id = auth.uid());

-- ---- Consultants : profil public si vérifié ; le consultant gère le sien ----
create policy consultants_read on consultants for select
  using (is_verified = true or id = auth.uid() or is_admin());
create policy consultants_self_update on consultants for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy consultants_admin on consultants for all
  using (is_admin()) with check (is_admin());

-- Créneaux : lecture publique (pour réserver) ; consultant gère les siens.
create policy dispo_read on disponibilites for select using (true);
create policy dispo_owner on disponibilites for all
  using (consultant_id = auth.uid() or is_admin())
  with check (consultant_id = auth.uid());

-- Consultations : visibles par le bachelier concerné ET le consultant concerné.
create policy consult_read on consultations for select
  using (bachelier_id = auth.uid() or consultant_id = auth.uid() or is_admin());
create policy consult_bachelier_insert on consultations for insert
  with check (bachelier_id = auth.uid());
create policy consult_parties_update on consultations for update
  using (bachelier_id = auth.uid() or consultant_id = auth.uid() or is_admin());

-- ---- Inscriptions école (CPA) : le bachelier voit les siennes ;
--      un membre école voit celles de SON école ; admin voit tout. ----
create policy inscr_read on inscriptions_ecole for select
  using (bachelier_id = auth.uid() or is_ecole_member(ecole_id) or is_admin());
create policy inscr_ecole_update on inscriptions_ecole for update
  using (is_ecole_member(ecole_id) or is_admin())
  with check (is_ecole_member(ecole_id) or is_admin());
create policy inscr_admin_write on inscriptions_ecole for all
  using (is_admin()) with check (is_admin());

-- ---- Paiements : chacun voit les siens. L'écriture passe côté serveur
--      (service_role) via webhook Fedapay -> bypasse la RLS. ----
create policy payments_read_own on payments for select
  using (user_id = auth.uid() or is_admin());
