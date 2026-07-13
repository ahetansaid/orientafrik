import { z } from 'zod';

// Édition de la fiche école par un membre staff.
export const ficheEcoleSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis.').max(120),
  ville: z.string().trim().max(80).optional(),
  description: z.string().trim().max(2000).optional(),
  fraisMinFcfa: z.coerce.number().int().min(0).optional(),
  fraisMaxFcfa: z.coerce.number().int().min(0).optional(),
});

export type FicheEcoleValues = z.infer<typeof ficheEcoleSchema>;

// Avancement d'une candidature dans le funnel CPA.
export const avancerSchema = z.object({
  inscriptionId: z.string().uuid(),
  statut: z.enum(['candidature', 'inscrite', 'annulee']),
});

export type AvancerValues = z.infer<typeof avancerSchema>;
