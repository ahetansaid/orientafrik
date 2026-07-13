-- =====================================================================
-- 0009 — Bucket Storage privé 'plans-pdf' + policies d'accès
-- Les PDF payants sont cachés ici. Convention de chemin : {bachelier_id}/{plan_id}.pdf
-- Servis via URL signée (jamais public). L'écriture passe par le route handler
-- (service_role) ; la lecture directe est réservée au propriétaire.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('plans-pdf', 'plans-pdf', false)
on conflict (id) do nothing;

-- Le propriétaire peut lire ses propres PDF (1er segment du chemin = son uuid).
create policy "plans_pdf_read_own"
  on storage.objects for select
  using (
    bucket_id = 'plans-pdf'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin : accès complet au bucket.
create policy "plans_pdf_admin_all"
  on storage.objects for all
  using (bucket_id = 'plans-pdf' and is_admin())
  with check (bucket_id = 'plans-pdf' and is_admin());
