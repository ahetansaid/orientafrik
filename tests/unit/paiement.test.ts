import { describe, it, expect } from 'vitest';
import { versPaymentStatut } from '@/features/paiement/domain/fedapay.types';

describe('versPaymentStatut', () => {
  it('mappe approved/transferred -> succeeded', () => {
    expect(versPaymentStatut('approved')).toBe('succeeded');
    expect(versPaymentStatut('transferred')).toBe('succeeded');
  });

  it('mappe declined/canceled -> failed', () => {
    expect(versPaymentStatut('declined')).toBe('failed');
    expect(versPaymentStatut('canceled')).toBe('failed');
  });

  it('mappe refunded -> refunded', () => {
    expect(versPaymentStatut('refunded')).toBe('refunded');
  });

  it('tout statut inconnu reste pending (prudence)', () => {
    expect(versPaymentStatut('pending')).toBe('pending');
    expect(versPaymentStatut('n_importe_quoi')).toBe('pending');
  });
});
