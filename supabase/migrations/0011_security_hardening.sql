-- =====================================================================
-- 0011 — Durcissement sécurité (privilèges au niveau COLONNE)
-- =====================================================================
-- Faille corrigée : les policies RLS `for all`/`update` ne valident que
-- l'appartenance de la ligne (id/bachelier_id = auth.uid()), jamais QUELLES
-- colonnes sont écrites. Avec des GRANT larges, un utilisateur pouvait modifier
-- des colonnes privilégiées sur SES propres lignes :
--   • profiles.role         -> s'auto-promouvoir admin (élévation de privilèges)
--   • plans_parcours.is_paid -> obtenir le PDF payant gratuitement
--   • consultations.statut/prix, ecoles.commission, consultants.is_verified ...
--
-- Correctif : les colonnes « sensibles » (argent, statut, rôle, vérification)
-- ne sont écrites QUE par le service_role (webhook Fedapay + actions admin
-- serveur). Les rôles anon/authenticated reçoivent des privilèges au niveau
-- colonne, strictement limités à ce que l'utilisateur a le droit de saisir.
-- La RLS (0007) reste le garde de LIGNE ; les grants colonne gardent les CHAMPS.
-- =====================================================================

-- ---------- anon : lecture seule (aucune écriture) ----------
revoke insert, update, delete on all tables in schema public from anon;
alter default privileges in schema public revoke insert, update, delete on tables from anon;

-- ---------- profiles : l'utilisateur édite son identité, JAMAIS son rôle ----------
revoke insert, update, delete on profiles from authenticated;
grant update (full_name, phone, updated_at) on profiles to authenticated;
-- role/email : modifiés uniquement par le trigger (inscription) ou le service_role (admin).

-- ---------- plans_parcours : is_paid / pdf_url / paid_at réservés au webhook ----------
revoke insert, update, delete on plans_parcours from authenticated;
grant insert (bachelier_id, profil_id, parcours_principal_id, data) on plans_parcours to authenticated;
grant update (share_slug, shared_at) on plans_parcours to authenticated;

-- ---------- consultations : création + confirmation financière côté serveur ----------
-- L'action de réservation insère via service_role (montants/commission calculés
-- serveur). Le consultant ne peut que faire avancer le statut de SES consultations.
drop policy if exists consult_bachelier_insert on consultations;
drop policy if exists consult_parties_update on consultations;
revoke insert, update, delete on consultations from authenticated;
grant update (statut, notes) on consultations to authenticated;
create policy consult_consultant_update on consultations for update
  using (consultant_id = auth.uid() or is_admin())
  with check (consultant_id = auth.uid() or is_admin());

-- ---------- inscriptions_ecole : le bachelier crée une 'orientee' neutre ----------
revoke insert, update, delete on inscriptions_ecole from authenticated;
grant insert (bachelier_id, ecole_id, plan_id) on inscriptions_ecole to authenticated;
grant update (statut, commission_fcfa, confirmed_by, inscrite_at) on inscriptions_ecole to authenticated;
-- Insertion bachelier : uniquement pour soi, au statut initial, sans commission.
create policy inscr_bachelier_insert on inscriptions_ecole for insert
  with check (
    bachelier_id = auth.uid()
    and statut = 'orientee'
    and commission_fcfa is null
    and confirmed_by is null
  );
-- L'avancement (statut/commission) reste régi par inscr_ecole_update (membre école)
-- + inscr_admin_write (admin). Les colonnes autorisées ci-dessus, combinées à ces
-- policies de LIGNE, empêchent un bachelier de se faire passer 'inscrite'.

-- ---------- ecoles : un membre édite la FICHE, jamais commission/partenariat ----------
revoke insert, update, delete on ecoles from authenticated;
grant update (nom, ville, description, logo_url, frais_min_fcfa, frais_max_fcfa, updated_at)
  on ecoles to authenticated;
-- partenariat / commission_* / badge : configurés par l'admin (service_role).

-- ---------- consultants : édite son profil public, ne s'auto-vérifie pas ----------
revoke insert, update, delete on consultants from authenticated;
grant update (bio, specialites, photo_url) on consultants to authenticated;
-- is_verified : accordé par l'admin (service_role).

-- ---------- payments : aucune écriture applicative (déjà : pas de policy) ----------
revoke insert, update, delete on payments from authenticated;
-- Lecture via payments_read_own ; écriture via webhook (service_role) uniquement.
