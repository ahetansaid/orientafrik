-- =====================================================================
-- 0008 — Seed des types de consultation (cf. §8.3 du doc)
-- Idempotent (safe en prod) : on ne réinsère pas un code déjà présent.
-- =====================================================================
insert into consultation_types (code, libelle, duree_min, tarif_fcfa, commission_pct) values
  ('n1',         'Orientation niveau 1 (gratuite)', 15, 0,      0),
  ('n2',         'Consultation standard',           45, 15000,  20),
  ('n3',         'Consultation approfondie',        90, 25000,  20),
  ('pack_bourse','Pack montage dossier bourse',    120, 50000,  20),
  ('pack_intl',  'Pack candidature internationale',240, 100000, 20)
on conflict (code) do nothing;
