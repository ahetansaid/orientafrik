import type { InscriptionStatut } from '@/lib/supabase/enums';

// Funnel CPA (Coût Par Acquisition) : orientee -> candidature -> inscrite.
// `annulee` est un état terminal atteignable depuis les états non finaux.
// La commission n'est DUE qu'à l'état `inscrite` (confirmé côté école/admin).

const TRANSITIONS: Record<InscriptionStatut, InscriptionStatut[]> = {
  orientee: ['candidature', 'annulee'],
  candidature: ['inscrite', 'annulee'],
  inscrite: [], // terminal (commission due)
  annulee: [], // terminal
};

export function transitionAutorisee(de: InscriptionStatut, vers: InscriptionStatut): boolean {
  return TRANSITIONS[de].includes(vers);
}

export function estTerminal(statut: InscriptionStatut): boolean {
  return TRANSITIONS[statut].length === 0;
}

// La commission due à l'inscription. En MVP on retient le plancher négocié
// (commission_min_fcfa) ; null si l'école n'est pas partenaire commissionné.
export function commissionInscription(commissionMinFcfa: number | null): number | null {
  if (commissionMinFcfa == null || commissionMinFcfa <= 0) return null;
  return commissionMinFcfa;
}
