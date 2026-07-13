// Constantes produit centralisées (tarifs, marque, commissions).

export const MARQUE = 'ORIENTAFRIK';
export const SLOGAN = 'Ton orientation post-bac, sans hasard.';

// Tarifs (FCFA entiers).
export const TARIF_PDF_FCFA = 200;

// Commission par défaut appliquée aux consultations payantes (%).
export const COMMISSION_CONSULTANT_PCT = 20;

// Couleurs marque (miroir du thème Tailwind ; utilisées là où on ne peut pas
// passer par une classe — ex. génération d'image OG, PDF).
export const BRAND = {
  navy: '#12224a',
  gold: '#b8860b',
  goldSoft: '#a6790a',
  emerald: '#047857',
} as const;

export const TZ_BENIN = 'Africa/Porto-Novo';
