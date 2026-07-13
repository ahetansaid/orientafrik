import { describe, it, expect } from 'vitest';
import { profilSchema, versProfilBachelier } from '@/features/bachelier/domain/profil.schema';

const valide = {
  prenom: 'Aïcha',
  serie: 'C',
  moyenne: '13.5',
  interets: ['sante', 'sciences'],
  budgetAnnuelFcfa: '300000',
  mobilite: 'benin',
  ambitionInternationale: false,
};

describe('profilSchema', () => {
  it('accepte un profil valide et coerce les nombres', () => {
    const r = profilSchema.safeParse(valide);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.moyenne).toBe(13.5);
      expect(r.data.budgetAnnuelFcfa).toBe(300000);
    }
  });

  it('rejette une moyenne hors bornes', () => {
    expect(profilSchema.safeParse({ ...valide, moyenne: '25' }).success).toBe(false);
  });

  it('exige au moins un intérêt', () => {
    expect(profilSchema.safeParse({ ...valide, interets: [] }).success).toBe(false);
  });

  it('refuse plus de 5 intérêts', () => {
    const trop = ['sante', 'sciences', 'technologie', 'logique', 'business', 'creer'];
    expect(profilSchema.safeParse({ ...valide, interets: trop }).success).toBe(false);
  });

  it('versProfilBachelier projette la forme attendue par le moteur', () => {
    const r = profilSchema.parse(valide);
    const p = versProfilBachelier(r);
    expect(p).toEqual({
      serie: 'C',
      moyenne: 13.5,
      interets: ['sante', 'sciences'],
      budgetAnnuelFcfa: 300000,
      mobilite: 'benin',
      ambitionInternationale: false,
    });
  });
});
