CREATE TYPE "public"."bac_serie" AS ENUM('A1', 'A2', 'B', 'C', 'D', 'E', 'F', 'G', 'autre');--> statement-breakpoint
CREATE TYPE "public"."consultation_statut" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."contenu_statut" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ecole_type" AS ENUM('publique', 'privee_premium', 'privee_moyenne', 'privee_accessible', 'internationale');--> statement-breakpoint
CREATE TYPE "public"."inscription_statut" AS ENUM('orientee', 'candidature', 'inscrite', 'annulee');--> statement-breakpoint
CREATE TYPE "public"."mobilite" AS ENUM('cotonou', 'benin', 'uemoa', 'international');--> statement-breakpoint
CREATE TYPE "public"."partenariat_statut" AS ENUM('non_partenaire', 'prospect', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."payment_purpose" AS ENUM('pdf_plan', 'consultation');--> statement-breakpoint
CREATE TYPE "public"."payment_statut" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('bachelier', 'ecole', 'consultant', 'admin');--> statement-breakpoint
CREATE TABLE "bachelier_profils" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bachelier_id" text NOT NULL,
	"serie_bac" "bac_serie",
	"moyenne" numeric(4, 2),
	"interets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"budget_annuel_fcfa" integer,
	"mobilite" "mobilite" DEFAULT 'benin' NOT NULL,
	"ambition_internationale" boolean DEFAULT false NOT NULL,
	"scores" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bourses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nom" text NOT NULL,
	"organisme" text,
	"pays" text,
	"montant" text,
	"criteres" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"date_limite" date,
	"lien" text,
	"statut" "contenu_statut" DEFAULT 'draft' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultants" (
	"id" text PRIMARY KEY NOT NULL,
	"bio" text,
	"specialites" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultation_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"libelle" text NOT NULL,
	"duree_min" integer NOT NULL,
	"tarif_fcfa" integer DEFAULT 0 NOT NULL,
	"commission_pct" integer DEFAULT 20 NOT NULL,
	CONSTRAINT "consultation_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bachelier_id" text NOT NULL,
	"consultant_id" text NOT NULL,
	"type_id" uuid NOT NULL,
	"slot_id" uuid,
	"statut" "consultation_statut" DEFAULT 'pending' NOT NULL,
	"prix_fcfa" integer DEFAULT 0 NOT NULL,
	"commission_fcfa" integer DEFAULT 0 NOT NULL,
	"net_consultant_fcfa" integer DEFAULT 0 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disponibilites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultant_id" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"is_booked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecole_membres" (
	"ecole_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role_ecole" text DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ecole_membres_ecole_id_user_id_pk" PRIMARY KEY("ecole_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "ecoles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"type" "ecole_type" NOT NULL,
	"ville" text,
	"description" text,
	"logo_url" text,
	"frais_min_fcfa" integer,
	"frais_max_fcfa" integer,
	"statut" "contenu_statut" DEFAULT 'draft' NOT NULL,
	"partenariat" "partenariat_statut" DEFAULT 'non_partenaire' NOT NULL,
	"commission_min_fcfa" integer,
	"commission_max_fcfa" integer,
	"plafond_mensuel_fcfa" integer,
	"badge" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ecoles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inscriptions_ecole" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bachelier_id" text NOT NULL,
	"ecole_id" uuid NOT NULL,
	"plan_id" uuid,
	"statut" "inscription_statut" DEFAULT 'orientee' NOT NULL,
	"commission_fcfa" integer,
	"confirmed_by" text,
	"orientee_at" timestamp with time zone DEFAULT now() NOT NULL,
	"inscrite_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "parcours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"titre" text NOT NULL,
	"domaine" text NOT NULL,
	"resume" text,
	"contenu" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"statut" "contenu_statut" DEFAULT 'draft' NOT NULL,
	"verified_by" text,
	"verified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parcours_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"purpose" "payment_purpose" NOT NULL,
	"amount_fcfa" integer NOT NULL,
	"statut" "payment_statut" DEFAULT 'pending' NOT NULL,
	"fedapay_transaction_id" text,
	"related_type" text,
	"related_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans_parcours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bachelier_id" text NOT NULL,
	"profil_id" uuid NOT NULL,
	"parcours_principal_id" uuid,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"pdf_url" text,
	"paid_at" timestamp with time zone,
	"share_slug" text,
	"shared_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_parcours_share_slug_unique" UNIQUE("share_slug")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'bachelier' NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bachelier_profils" ADD CONSTRAINT "bachelier_profils_bachelier_id_profiles_id_fk" FOREIGN KEY ("bachelier_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultants" ADD CONSTRAINT "consultants_id_profiles_id_fk" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_bachelier_id_profiles_id_fk" FOREIGN KEY ("bachelier_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_type_id_consultation_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."consultation_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_slot_id_disponibilites_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."disponibilites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disponibilites" ADD CONSTRAINT "disponibilites_consultant_id_consultants_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "public"."consultants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecole_membres" ADD CONSTRAINT "ecole_membres_ecole_id_ecoles_id_fk" FOREIGN KEY ("ecole_id") REFERENCES "public"."ecoles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecole_membres" ADD CONSTRAINT "ecole_membres_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions_ecole" ADD CONSTRAINT "inscriptions_ecole_bachelier_id_profiles_id_fk" FOREIGN KEY ("bachelier_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions_ecole" ADD CONSTRAINT "inscriptions_ecole_ecole_id_ecoles_id_fk" FOREIGN KEY ("ecole_id") REFERENCES "public"."ecoles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions_ecole" ADD CONSTRAINT "inscriptions_ecole_plan_id_plans_parcours_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans_parcours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscriptions_ecole" ADD CONSTRAINT "inscriptions_ecole_confirmed_by_profiles_id_fk" FOREIGN KEY ("confirmed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcours" ADD CONSTRAINT "parcours_verified_by_profiles_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans_parcours" ADD CONSTRAINT "plans_parcours_bachelier_id_profiles_id_fk" FOREIGN KEY ("bachelier_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans_parcours" ADD CONSTRAINT "plans_parcours_profil_id_bachelier_profils_id_fk" FOREIGN KEY ("profil_id") REFERENCES "public"."bachelier_profils"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans_parcours" ADD CONSTRAINT "plans_parcours_parcours_principal_id_parcours_id_fk" FOREIGN KEY ("parcours_principal_id") REFERENCES "public"."parcours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bachelier_profils_bachelier_idx" ON "bachelier_profils" USING btree ("bachelier_id");--> statement-breakpoint
CREATE INDEX "consultations_consultant_idx" ON "consultations" USING btree ("consultant_id");--> statement-breakpoint
CREATE INDEX "consultations_bachelier_idx" ON "consultations" USING btree ("bachelier_id");--> statement-breakpoint
CREATE INDEX "disponibilites_consultant_idx" ON "disponibilites" USING btree ("consultant_id","start_at");--> statement-breakpoint
CREATE INDEX "inscriptions_ecole_ecole_idx" ON "inscriptions_ecole" USING btree ("ecole_id");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_fedapay_tx_uidx" ON "payments" USING btree ("fedapay_transaction_id") WHERE "payments"."fedapay_transaction_id" is not null;--> statement-breakpoint
CREATE INDEX "plans_parcours_bachelier_idx" ON "plans_parcours" USING btree ("bachelier_id");