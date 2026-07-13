import { describe, it, expect } from 'vitest';
import {
  transitionAutorisee,
  estTerminal,
  commissionInscription,
} from '@/features/ecole/domain/cpa';

describe('funnel CPA — transitions', () => {
  it('autorise orientee -> candidature -> inscrite', () => {
    expect(transitionAutorisee('orientee', 'candidature')).toBe(true);
    expect(transitionAutorisee('candidature', 'inscrite')).toBe(true);
  });

  it('autorise l’annulation depuis les états non finaux', () => {
    expect(transitionAutorisee('orientee', 'annulee')).toBe(true);
    expect(transitionAutorisee('candidature', 'annulee')).toBe(true);
  });

  it('interdit de sauter une étape (orientee -> inscrite)', () => {
    expect(transitionAutorisee('orientee', 'inscrite')).toBe(false);
  });

  it('interdit toute transition depuis un état terminal', () => {
    expect(transitionAutorisee('inscrite', 'annulee')).toBe(false);
    expect(transitionAutorisee('annulee', 'orientee')).toBe(false);
    expect(estTerminal('inscrite')).toBe(true);
    expect(estTerminal('annulee')).toBe(true);
    expect(estTerminal('orientee')).toBe(false);
  });
});

describe('commissionInscription', () => {
  it('retient le plancher négocié', () => {
    expect(commissionInscription(25000)).toBe(25000);
  });
  it('null si non commissionné (0 ou absent)', () => {
    expect(commissionInscription(0)).toBeNull();
    expect(commissionInscription(null)).toBeNull();
  });
});
