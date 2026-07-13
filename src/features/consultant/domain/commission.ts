// Calcul de commission d'une consultation payante. Règle MVP : la plateforme
// prélève `commissionPct` %, le consultant touche le net. Montants FCFA entiers.
// La commission n'est *réalisée* qu'à la confirmation du paiement, mais on la
// calcule dès la réservation pour figer les montants.
export interface RepartitionConsultation {
  prixFcfa: number;
  commissionFcfa: number;
  netConsultantFcfa: number;
}

export function calculerRepartition(
  prixFcfa: number,
  commissionPct: number,
): RepartitionConsultation {
  const pct = Math.max(0, Math.min(100, commissionPct));
  const commissionFcfa = Math.round((prixFcfa * pct) / 100);
  return {
    prixFcfa,
    commissionFcfa,
    netConsultantFcfa: prixFcfa - commissionFcfa,
  };
}
