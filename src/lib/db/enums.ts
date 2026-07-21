// Types d'enums dérivés du schéma Drizzle (remplacent @/lib/db/enums).
import {
  userRole,
  bacSerie,
  ecoleType,
  mobilite,
  contenuStatut,
  partenariatStatut,
  paymentPurpose,
  paymentStatut,
  consultationStatut,
  inscriptionStatut,
} from '@/lib/db/schema';

export type UserRole = (typeof userRole.enumValues)[number];
export type BacSerie = (typeof bacSerie.enumValues)[number];
export type EcoleType = (typeof ecoleType.enumValues)[number];
export type Mobilite = (typeof mobilite.enumValues)[number];
export type ContenuStatut = (typeof contenuStatut.enumValues)[number];
export type PartenariatStatut = (typeof partenariatStatut.enumValues)[number];
export type PaymentPurpose = (typeof paymentPurpose.enumValues)[number];
export type PaymentStatut = (typeof paymentStatut.enumValues)[number];
export type ConsultationStatut = (typeof consultationStatut.enumValues)[number];
export type InscriptionStatut = (typeof inscriptionStatut.enumValues)[number];
