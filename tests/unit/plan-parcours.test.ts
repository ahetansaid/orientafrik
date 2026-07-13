import { describe, it, expect } from 'vitest';
import {
  scorerFiliere,
  assemblerPlan,
  type ProfilBachelier,
} from '@/features/bachelier/domain/plan-parcours';

// Catalogue factice conforme à la forme attendue par le moteur.
const filiere = (over: Partial<Parameters<typeof scorerFiliere>[1]> = {}) => ({
  slug: 'info',
  titre: 'Informatique',
  domaine: 'Numérique',
  seriesAffinite: ['C', 'D'],
  interetsCles: ['technologie', 'logique'],
  dureeAnnees: 3,
  debouches: ['Développeur'],
  coutIndicatifFcfa: [250000, 900000] as [number, number],
  contenu: {},
  ...over,
});

const profilBase: ProfilBachelier = {
  serie: 'C',
  moyenne: 14,
  interets: ['technologie', 'logique'],
  budgetAnnuelFcfa: 500000,
  mobilite: 'benin',
  ambitionInternationale: false,
};

describe('scorerFiliere', () => {
  it('additionne série (40) + 2 intérêts (20) + budget (20) + mérite (10) = 90', () => {
    const { score } = scorerFiliere(profilBase, filiere());
    expect(score).toBe(90);
  });

  it('plafonne le score à 100', () => {
    const { score } = scorerFiliere(
      { ...profilBase, interets: ['technologie', 'logique', 'creer', 'x'] },
      filiere({ interetsCles: ['technologie', 'logique', 'creer', 'x'] }),
    );
    expect(score).toBeLessThanOrEqual(100);
  });

  it("n'octroie pas les points série quand la série ne correspond pas", () => {
    const { score } = scorerFiliere({ ...profilBase, serie: 'A1' }, filiere());
    expect(score).toBe(50); // 20 intérêts + 20 budget + 10 mérite
  });

  it('signale un coût supérieur au budget dans la justification', () => {
    const { pourquoi } = scorerFiliere(
      { ...profilBase, budgetAnnuelFcfa: 1000 },
      filiere({ coutIndicatifFcfa: [250000, 900000] }),
    );
    expect(pourquoi).toContain('bourse');
  });
});

describe('assemblerPlan', () => {
  const catalogue = [
    filiere({ slug: 'info', titre: 'Informatique' }),
    filiere({ slug: 'gestion', titre: 'Gestion', seriesAffinite: ['B'], interetsCles: ['business'] }),
    filiere({ slug: 'medecine', titre: 'Médecine', seriesAffinite: ['C'], interetsCles: ['sante'] }),
  ];

  it('renvoie un top3 trié par score décroissant', () => {
    const plan = assemblerPlan(profilBase, 'Ada', catalogue, [], [], { premium: false });
    expect(plan.top3).toHaveLength(3);
    expect(plan.top3[0]!.score).toBeGreaterThanOrEqual(plan.top3[1]!.score);
    expect(plan.top3[1]!.score).toBeGreaterThanOrEqual(plan.top3[2]!.score);
    expect(plan.top3[0]!.slug).toBe('info');
  });

  it('reste léger en gratuit : pas de bloc premium', () => {
    const plan = assemblerPlan(profilBase, 'Ada', catalogue, [], [], { premium: false });
    expect(plan.premium).toBeUndefined();
  });

  it('ajoute le bloc premium et le catalogue complet en payant', () => {
    const ecoles = Array.from({ length: 8 }, (_, i) => ({
      nom: `École ${i}`,
      ville: 'Cotonou',
      type: 'privee_moyenne',
      fraisAnnuelsFcfa: [300000, 900000] as [number, number],
      estPartenaire: i === 0,
    }));
    const plan = assemblerPlan(profilBase, 'Ada', catalogue, ecoles, [], { premium: true });
    expect(plan.premium).toBeDefined();
    expect(plan.ecoles).toHaveLength(8); // gratuit tronquerait à 6
  });
});
