// =====================================================================
// Schéma Drizzle — source de vérité du modèle de données (Neon/Postgres).
// Miroir des anciennes migrations Supabase 0001…0006 (tables + enums).
// La RLS (Neon Authorize) et les GRANT colonne sont appliqués via SQL dédié
// (voir drizzle/ + docs/NEON_MIGRATION.md phase 3).
// =====================================================================
import { sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  date,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ---------- Enums ----------
export const userRole = pgEnum('user_role', ['bachelier', 'ecole', 'consultant', 'admin']);
export const bacSerie = pgEnum('bac_serie', ['A1', 'A2', 'B', 'C', 'D', 'E', 'F', 'G', 'autre']);
export const ecoleType = pgEnum('ecole_type', [
  'publique',
  'privee_premium',
  'privee_moyenne',
  'privee_accessible',
  'internationale',
]);
export const mobilite = pgEnum('mobilite', ['cotonou', 'benin', 'uemoa', 'international']);
export const contenuStatut = pgEnum('contenu_statut', ['draft', 'published', 'archived']);
export const partenariatStatut = pgEnum('partenariat_statut', [
  'non_partenaire',
  'prospect',
  'active',
  'suspended',
]);
export const paymentPurpose = pgEnum('payment_purpose', ['pdf_plan', 'consultation']);
export const paymentStatut = pgEnum('payment_statut', [
  'pending',
  'succeeded',
  'failed',
  'refunded',
]);
export const consultationStatut = pgEnum('consultation_statut', [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show',
]);
export const inscriptionStatut = pgEnum('inscription_statut', [
  'orientee',
  'candidature',
  'inscrite',
  'annulee',
]);

// ---------- Identité ----------
// profiles.id = id utilisateur Stack Auth (synchronisé par Neon Auth dans
// neon_auth.users_sync). Le `role` métier vit ici.
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: userRole('role').notNull().default('bachelier'),
  fullName: text('full_name'),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Contenu public ----------
export const parcours = pgTable('parcours', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  titre: text('titre').notNull(),
  domaine: text('domaine').notNull(),
  resume: text('resume'),
  contenu: jsonb('contenu')
    .notNull()
    .default(sql`'{}'::jsonb`),
  statut: contenuStatut('statut').notNull().default('draft'),
  verifiedBy: uuid('verified_by').references(() => profiles.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ecoles = pgTable('ecoles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  type: ecoleType('type').notNull(),
  ville: text('ville'),
  description: text('description'),
  logoUrl: text('logo_url'),
  fraisMinFcfa: integer('frais_min_fcfa'),
  fraisMaxFcfa: integer('frais_max_fcfa'),
  statut: contenuStatut('statut').notNull().default('draft'),
  partenariat: partenariatStatut('partenariat').notNull().default('non_partenaire'),
  commissionMinFcfa: integer('commission_min_fcfa'),
  commissionMaxFcfa: integer('commission_max_fcfa'),
  plafondMensuelFcfa: integer('plafond_mensuel_fcfa'),
  badge: text('badge'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const ecoleMembres = pgTable(
  'ecole_membres',
  {
    ecoleId: uuid('ecole_id')
      .notNull()
      .references(() => ecoles.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    roleEcole: text('role_ecole').notNull().default('staff'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.ecoleId, t.userId] })],
);

export const bourses = pgTable('bourses', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom: text('nom').notNull(),
  organisme: text('organisme'),
  pays: text('pays'),
  montant: text('montant'),
  criteres: jsonb('criteres')
    .notNull()
    .default(sql`'{}'::jsonb`),
  dateLimite: date('date_limite'),
  lien: text('lien'),
  statut: contenuStatut('statut').notNull().default('draft'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Bachelier ----------
export const bachelierProfils = pgTable(
  'bachelier_profils',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bachelierId: uuid('bachelier_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    serieBac: bacSerie('serie_bac'),
    moyenne: numeric('moyenne', { precision: 4, scale: 2 }),
    interets: jsonb('interets')
      .notNull()
      .default(sql`'[]'::jsonb`),
    budgetAnnuelFcfa: integer('budget_annuel_fcfa'),
    mobilite: mobilite('mobilite').notNull().default('benin'),
    ambitionInternationale: boolean('ambition_internationale').notNull().default(false),
    scores: jsonb('scores')
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('bachelier_profils_bachelier_idx').on(t.bachelierId)],
);

export const plansParcours = pgTable(
  'plans_parcours',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bachelierId: uuid('bachelier_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    profilId: uuid('profil_id')
      .notNull()
      .references(() => bachelierProfils.id, { onDelete: 'cascade' }),
    parcoursPrincipalId: uuid('parcours_principal_id').references(() => parcours.id),
    data: jsonb('data')
      .notNull()
      .default(sql`'{}'::jsonb`),
    isPaid: boolean('is_paid').notNull().default(false),
    pdfUrl: text('pdf_url'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    shareSlug: text('share_slug').unique(),
    sharedAt: timestamp('shared_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('plans_parcours_bachelier_idx').on(t.bachelierId)],
);

// ---------- Consultant ----------
export const consultants = pgTable('consultants', {
  id: uuid('id')
    .primaryKey()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  specialites: jsonb('specialites')
    .notNull()
    .default(sql`'[]'::jsonb`),
  isVerified: boolean('is_verified').notNull().default(false),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const consultationTypes = pgTable('consultation_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  libelle: text('libelle').notNull(),
  dureeMin: integer('duree_min').notNull(),
  tarifFcfa: integer('tarif_fcfa').notNull().default(0),
  commissionPct: integer('commission_pct').notNull().default(20),
});

export const disponibilites = pgTable(
  'disponibilites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    consultantId: uuid('consultant_id')
      .notNull()
      .references(() => consultants.id, { onDelete: 'cascade' }),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }).notNull(),
    isBooked: boolean('is_booked').notNull().default(false),
  },
  (t) => [index('disponibilites_consultant_idx').on(t.consultantId, t.startAt)],
);

export const consultations = pgTable(
  'consultations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bachelierId: uuid('bachelier_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    consultantId: uuid('consultant_id')
      .notNull()
      .references(() => consultants.id),
    typeId: uuid('type_id')
      .notNull()
      .references(() => consultationTypes.id),
    slotId: uuid('slot_id').references(() => disponibilites.id),
    statut: consultationStatut('statut').notNull().default('pending'),
    prixFcfa: integer('prix_fcfa').notNull().default(0),
    commissionFcfa: integer('commission_fcfa').notNull().default(0),
    netConsultantFcfa: integer('net_consultant_fcfa').notNull().default(0),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('consultations_consultant_idx').on(t.consultantId),
    index('consultations_bachelier_idx').on(t.bachelierId),
  ],
);

// ---------- École / CPA ----------
export const inscriptionsEcole = pgTable(
  'inscriptions_ecole',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    bachelierId: uuid('bachelier_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    ecoleId: uuid('ecole_id')
      .notNull()
      .references(() => ecoles.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id').references(() => plansParcours.id),
    statut: inscriptionStatut('statut').notNull().default('orientee'),
    commissionFcfa: integer('commission_fcfa'),
    confirmedBy: uuid('confirmed_by').references(() => profiles.id),
    orienteeAt: timestamp('orientee_at', { withTimezone: true }).notNull().defaultNow(),
    inscriteAt: timestamp('inscrite_at', { withTimezone: true }),
  },
  (t) => [index('inscriptions_ecole_ecole_idx').on(t.ecoleId)],
);

// ---------- Paiements ----------
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    purpose: paymentPurpose('purpose').notNull(),
    amountFcfa: integer('amount_fcfa').notNull(),
    statut: paymentStatut('statut').notNull().default('pending'),
    fedapayTransactionId: text('fedapay_transaction_id'),
    relatedType: text('related_type'),
    relatedId: uuid('related_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('payments_user_idx').on(t.userId),
    uniqueIndex('payments_fedapay_tx_uidx')
      .on(t.fedapayTransactionId)
      .where(sql`${t.fedapayTransactionId} is not null`),
  ],
);
