'use client';

// Événements du funnel, nommés une seule fois pour éviter la dérive de chaînes.
export const EVENTS = {
  profilComplete: 'profil_complete',
  infographieVue: 'infographie_vue',
  pdf402: 'pdf_402',
  paiementReussi: 'paiement_reussi',
  planPartage: 'plan_partage',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

type PlausibleFn = (event: string, options?: { props?: Record<string, string | number> }) => void;

// Émet un événement Plausible s'il est chargé (no-op sinon).
export function track(event: EventName, props?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  const plausible = (window as unknown as { plausible?: PlausibleFn }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
