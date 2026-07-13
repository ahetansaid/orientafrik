import type { FiliereRecommandee } from '@/features/bachelier/domain/plan-parcours';

// Vue publique NON-PII d'un plan partagé, renvoyée par la fonction SQL
// `get_shared_plan`. Volontairement réduite : prénom + top3 + scores.
// Aucun email, aucune moyenne, aucun nom complet.
export interface PlanPartage {
  prenom: string;
  serie: string;
  genereLe: string;
  top3: Pick<FiliereRecommandee, 'slug' | 'titre' | 'score' | 'pourquoi'>[];
}
