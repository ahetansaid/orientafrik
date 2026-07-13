import { describe, it, expect } from 'vitest';
import { calculerRepartition } from '@/features/consultant/domain/commission';

describe('calculerRepartition', () => {
  it('prélève 20 % et laisse 80 % au consultant', () => {
    const r = calculerRepartition(15000, 20);
    expect(r.commissionFcfa).toBe(3000);
    expect(r.netConsultantFcfa).toBe(12000);
  });

  it('consultation gratuite : commission et net à zéro', () => {
    const r = calculerRepartition(0, 20);
    expect(r.commissionFcfa).toBe(0);
    expect(r.netConsultantFcfa).toBe(0);
  });

  it('arrondit la commission à l’entier FCFA', () => {
    const r = calculerRepartition(25000, 20);
    expect(r.commissionFcfa).toBe(5000);
    expect(r.netConsultantFcfa).toBe(20000);
  });

  it('borne le pourcentage entre 0 et 100', () => {
    expect(calculerRepartition(1000, 150).commissionFcfa).toBe(1000);
    expect(calculerRepartition(1000, -10).commissionFcfa).toBe(0);
  });

  it('somme commission + net = prix (invariant)', () => {
    const r = calculerRepartition(33333, 20);
    expect(r.commissionFcfa + r.netConsultantFcfa).toBe(33333);
  });
});
