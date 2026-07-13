import { z } from 'zod';
import type { ProfilBachelier } from '@/features/bachelier/domain/plan-parcours';

// Source de vérité unique : valide le formulaire ET l'entrée de l'action.
// Les valeurs miroir des enums Postgres (bac_serie, mobilite).

export const SERIES_BAC = ['A1', 'A2', 'B', 'C', 'D', 'E', 'F', 'G', 'autre'] as const;
export const MOBILITES = ['cotonou', 'benin', 'uemoa', 'international'] as const;

// Catalogue d'intérêts proposés (aligné sur les `interetsCles` du contenu vérifié).
export const INTERETS = [
  'sante',
  'sciences',
  'technologie',
  'logique',
  'business',
  'communication',
  'creer',
  'aider',
  'organiser',
] as const;

export const profilSchema = z.object({
  prenom: z.string().trim().min(1, 'Ton prénom est requis.').max(60),
  serie: z.enum(SERIES_BAC, { message: 'Choisis ta série de bac.' }),
  moyenne: z.coerce
    .number({ message: 'Indique ta moyenne.' })
    .min(0, 'Moyenne minimale 0.')
    .max(20, 'Moyenne maximale 20.'),
  interets: z
    .array(z.enum(INTERETS))
    .min(1, 'Choisis au moins un centre d’intérêt.')
    .max(5, 'Cinq centres d’intérêt au maximum.'),
  budgetAnnuelFcfa: z.coerce.number().int().min(0, 'Le budget ne peut être négatif.'),
  mobilite: z.enum(MOBILITES),
  ambitionInternationale: z.boolean().default(false),
});

export type ProfilFormValues = z.infer<typeof profilSchema>;

// Le schéma produit exactement la forme ProfilBachelier attendue par le moteur.
export function versProfilBachelier(v: ProfilFormValues): ProfilBachelier {
  return {
    serie: v.serie,
    moyenne: v.moyenne,
    interets: v.interets,
    budgetAnnuelFcfa: v.budgetAnnuelFcfa,
    mobilite: v.mobilite,
    ambitionInternationale: v.ambitionInternationale,
  };
}
