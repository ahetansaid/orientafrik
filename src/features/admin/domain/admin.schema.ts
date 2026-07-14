import { z } from 'zod';

// Provisioning d'un rôle par l'admin (anti-fraude commission : jamais en self-service).
export const promouvoirSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['bachelier', 'consultant', 'ecole', 'admin']),
});
export type PromouvoirValues = z.infer<typeof promouvoirSchema>;

// Rattachement d'un utilisateur (staff) à une école.
export const rattacherSchema = z.object({
  userId: z.string().uuid(),
  ecoleId: z.string().uuid(),
  roleEcole: z.enum(['admin', 'staff']).default('staff'),
});
export type RattacherValues = z.infer<typeof rattacherSchema>;

// Changement de statut de publication d'un contenu.
export const publierSchema = z.object({
  type: z.enum(['parcours', 'ecoles', 'bourses']),
  id: z.string().uuid(),
  statut: z.enum(['draft', 'published', 'archived']),
});
export type PublierValues = z.infer<typeof publierSchema>;

// Configuration du partenariat CPA + commission d'une école.
export const partenariatSchema = z.object({
  ecoleId: z.string().uuid(),
  partenariat: z.enum(['non_partenaire', 'prospect', 'active', 'suspended']),
  commissionMinFcfa: z.coerce.number().int().min(0).optional(),
  commissionMaxFcfa: z.coerce.number().int().min(0).optional(),
});
export type PartenariatValues = z.infer<typeof partenariatSchema>;
