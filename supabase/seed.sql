-- =====================================================================
-- seed.sql — Données de développement (appliqué par `supabase db reset`)
-- NE PAS utiliser en production. Contenu factice pour faire tourner le POC.
-- =====================================================================

-- ---------- Catalogue de parcours (échantillon du MVP à 8) ----------
insert into parcours (slug, titre, domaine, resume, statut, contenu) values
(
  'medecine', 'Médecine', 'Santé',
  'Formation médicale longue menant au diplôme de docteur en médecine.',
  'published',
  jsonb_build_object(
    'seriesAffinite', jsonb_build_array('C','D'),
    'interetsCles',   jsonb_build_array('sante','sciences','aider'),
    'dureeAnnees',    7,
    'debouches',      jsonb_build_array('Médecin généraliste','Spécialiste','Recherche médicale'),
    'coutIndicatifFcfa', jsonb_build_array(300000, 1500000),
    'curriculum',     jsonb_build_array(
      'S1-S2 : Anatomie, biologie cellulaire, biophysique',
      'S3-S4 : Physiologie, biochimie, sémiologie',
      'S5-S6 : Pathologies, pharmacologie, stages hospitaliers'
    ),
    'temoignages',    jsonb_build_array(
      jsonb_build_object('auteur','Dr. Ada', 'texte','Exigeant mais passionnant, les stages font la différence.')
    ),
    'sources',        jsonb_build_array('Ministère de la Santé (Bénin), 2024')
  )
),
(
  'informatique', 'Génie informatique', 'Numérique',
  'Conception logicielle, réseaux et systèmes. Fort débouché régional.',
  'published',
  jsonb_build_object(
    'seriesAffinite', jsonb_build_array('C','D','F'),
    'interetsCles',   jsonb_build_array('technologie','logique','creer'),
    'dureeAnnees',    3,
    'debouches',      jsonb_build_array('Développeur','Administrateur systèmes','Data analyst'),
    'coutIndicatifFcfa', jsonb_build_array(250000, 900000),
    'curriculum',     jsonb_build_array(
      'L1 : Algorithmique, mathématiques discrètes, programmation',
      'L2 : Bases de données, réseaux, POO',
      'L3 : Génie logiciel, web, projet de fin d''études'
    ),
    'temoignages',    jsonb_build_array(
      jsonb_build_object('auteur','Kevin', 'texte','J''ai décroché un stage dès la L2 grâce aux projets.')
    ),
    'sources',        jsonb_build_array('Observatoire de l''emploi numérique UEMOA, 2023')
  )
),
(
  'gestion', 'Gestion & Commerce', 'Économie',
  'Management, comptabilité et marketing pour les organisations.',
  'published',
  jsonb_build_object(
    'seriesAffinite', jsonb_build_array('B','G'),
    'interetsCles',   jsonb_build_array('business','communication','organiser'),
    'dureeAnnees',    3,
    'debouches',      jsonb_build_array('Assistant de gestion','Chargé marketing','Entrepreneur'),
    'coutIndicatifFcfa', jsonb_build_array(200000, 700000),
    'curriculum',     jsonb_build_array(
      'L1 : Comptabilité générale, micro-économie, droit',
      'L2 : Marketing, gestion financière, statistiques',
      'L3 : Stratégie, contrôle de gestion, stage'
    ),
    'temoignages',    jsonb_build_array(),
    'sources',        jsonb_build_array('CCI Bénin, 2024')
  )
);

-- ---------- Écoles ----------
insert into ecoles (slug, nom, type, ville, statut, frais_min_fcfa, frais_max_fcfa, partenariat, badge) values
('uac',        'Université d''Abomey-Calavi', 'publique',           'Abomey-Calavi', 'published', 0,      50000,   'non_partenaire', null),
('epac',       'EPAC',                        'publique',           'Abomey-Calavi', 'published', 0,      60000,   'non_partenaire', null),
('esgis',      'ESGIS',                       'privee_moyenne',     'Cotonou',       'published', 350000, 900000,  'active',         'fondateur'),
('houdegbe',   'Houdegbé North American Univ.', 'privee_premium',   'Cotonou',       'published', 500000, 1500000, 'prospect',       null);

-- ---------- Bourses ----------
insert into bourses (nom, organisme, pays, montant, statut, criteres) values
('Bourse d''excellence Bénin', 'État béninois', 'Bénin', 'Frais + allocation', 'published',
  jsonb_build_object('moyenneMin', 14)),
('Bourse UEMOA mobilité',      'Commission UEMOA', 'UEMOA', 'Variable', 'published',
  jsonb_build_object('mobilite', 'uemoa')),
('Campus France',              'Ambassade de France', 'France', 'Selon dossier', 'published',
  jsonb_build_object('ambitionInternationale', true));
