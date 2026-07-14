import type { Database } from '@/lib/supabase/types';

// Alias de commodité pour les enums Postgres. `types.ts` est régénéré par
// `npm run db:types` (ne pas l'éditer) ; ces alias, stables, vivent ici.
type Enums = Database['public']['Enums'];

export type UserRole = Enums['user_role'];
export type BacSerie = Enums['bac_serie'];
export type EcoleType = Enums['ecole_type'];
export type Mobilite = Enums['mobilite'];
export type ContenuStatut = Enums['contenu_statut'];
export type PartenariatStatut = Enums['partenariat_statut'];
export type PaymentPurpose = Enums['payment_purpose'];
export type PaymentStatut = Enums['payment_statut'];
export type ConsultationStatut = Enums['consultation_statut'];
export type InscriptionStatut = Enums['inscription_statut'];
