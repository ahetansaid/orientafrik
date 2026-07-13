// =====================================================================
// Types de la base — PLACEHOLDER écrit à la main, fidèle aux migrations.
// À REMPLACER par la sortie de `npm run db:types` dès qu'une instance
// Supabase locale tourne (supabase start). Ne pas éditer manuellement ensuite.
// =====================================================================
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'bachelier' | 'ecole' | 'consultant' | 'admin';
export type BacSerie = 'A1' | 'A2' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'autre';
export type EcoleType =
  | 'publique'
  | 'privee_premium'
  | 'privee_moyenne'
  | 'privee_accessible'
  | 'internationale';
export type Mobilite = 'cotonou' | 'benin' | 'uemoa' | 'international';
export type ContenuStatut = 'draft' | 'published' | 'archived';
export type PartenariatStatut = 'non_partenaire' | 'prospect' | 'active' | 'suspended';
export type PaymentPurpose = 'pdf_plan' | 'consultation';
export type PaymentStatut = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type ConsultationStatut =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type InscriptionStatut = 'orientee' | 'candidature' | 'inscrite' | 'annulee';

type Timestamps = { created_at: string };

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<{
        id: string;
        role: UserRole;
        full_name: string | null;
        email: string | null;
        phone: string | null;
        created_at: string;
        updated_at: string;
      }>;
      parcours: Table<{
        id: string;
        slug: string;
        titre: string;
        domaine: string;
        resume: string | null;
        contenu: Json;
        statut: ContenuStatut;
        verified_by: string | null;
        verified_at: string | null;
        updated_at: string;
      }>;
      ecoles: Table<{
        id: string;
        slug: string;
        nom: string;
        type: EcoleType;
        ville: string | null;
        description: string | null;
        logo_url: string | null;
        frais_min_fcfa: number | null;
        frais_max_fcfa: number | null;
        statut: ContenuStatut;
        partenariat: PartenariatStatut;
        commission_min_fcfa: number | null;
        commission_max_fcfa: number | null;
        plafond_mensuel_fcfa: number | null;
        badge: string | null;
        created_at: string;
        updated_at: string;
      }>;
      ecole_membres: Table<{
        ecole_id: string;
        user_id: string;
        role_ecole: string;
        created_at: string;
      }>;
      bourses: Table<{
        id: string;
        nom: string;
        organisme: string | null;
        pays: string | null;
        montant: string | null;
        criteres: Json;
        date_limite: string | null;
        lien: string | null;
        statut: ContenuStatut;
        updated_at: string;
      }>;
      bachelier_profils: Table<{
        id: string;
        bachelier_id: string;
        serie_bac: BacSerie | null;
        moyenne: number | null;
        interets: Json;
        budget_annuel_fcfa: number | null;
        mobilite: Mobilite;
        ambition_internationale: boolean;
        scores: Json;
        created_at: string;
      }>;
      plans_parcours: Table<{
        id: string;
        bachelier_id: string;
        profil_id: string;
        parcours_principal_id: string | null;
        data: Json;
        is_paid: boolean;
        pdf_url: string | null;
        paid_at: string | null;
        share_slug: string | null;
        shared_at: string | null;
        created_at: string;
      }>;
      consultants: Table<{
        id: string;
        bio: string | null;
        specialites: Json;
        is_verified: boolean;
        photo_url: string | null;
        created_at: string;
      }>;
      consultation_types: Table<{
        id: string;
        code: string;
        libelle: string;
        duree_min: number;
        tarif_fcfa: number;
        commission_pct: number;
      }>;
      disponibilites: Table<{
        id: string;
        consultant_id: string;
        start_at: string;
        end_at: string;
        is_booked: boolean;
      }>;
      consultations: Table<{
        id: string;
        bachelier_id: string;
        consultant_id: string;
        type_id: string;
        slot_id: string | null;
        statut: ConsultationStatut;
        prix_fcfa: number;
        commission_fcfa: number;
        net_consultant_fcfa: number;
        scheduled_at: string | null;
        notes: string | null;
        created_at: string;
      }>;
      inscriptions_ecole: Table<{
        id: string;
        bachelier_id: string;
        ecole_id: string;
        plan_id: string | null;
        statut: InscriptionStatut;
        commission_fcfa: number | null;
        confirmed_by: string | null;
        orientee_at: string;
        inscrite_at: string | null;
      }>;
      payments: Table<
        {
          id: string;
          user_id: string;
          purpose: PaymentPurpose;
          amount_fcfa: number;
          statut: PaymentStatut;
          fedapay_transaction_id: string | null;
          related_type: string | null;
          related_id: string | null;
          created_at: string;
        } & Timestamps
      >;
    };
    Views: Record<never, never>;
    Functions: {
      get_shared_plan: {
        Args: { _slug: string };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      bac_serie: BacSerie;
      ecole_type: EcoleType;
      mobilite: Mobilite;
      contenu_statut: ContenuStatut;
      partenariat_statut: PartenariatStatut;
      payment_purpose: PaymentPurpose;
      payment_statut: PaymentStatut;
      consultation_statut: ConsultationStatut;
      inscription_statut: InscriptionStatut;
    };
    CompositeTypes: Record<never, never>;
  };
}
