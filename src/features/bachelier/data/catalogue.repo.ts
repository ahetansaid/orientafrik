import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { parcours, ecoles, bourses } from '@/lib/db/schema';
import type {
  ParcoursCatalogue,
  EcoleSuggeree,
  BourseSuggeree,
} from '@/features/bachelier/domain/plan-parcours';

// Forme (partielle) du jsonb `parcours.contenu` vérifié.
interface ContenuParcours {
  seriesAffinite?: string[];
  interetsCles?: string[];
  dureeAnnees?: number;
  debouches?: string[];
  coutIndicatifFcfa?: [number, number];
  curriculum?: string[];
  temoignages?: { auteur: string; texte: string }[];
  sources?: string[];
}

// Lit le catalogue publié et le projette dans les formes consommées par assemblerPlan.
export async function chargerCatalogue(db: DB): Promise<{
  parcours: ParcoursCatalogue[];
  ecoles: EcoleSuggeree[];
  bourses: BourseSuggeree[];
}> {
  const [pRows, eRows, bRows] = await Promise.all([
    db.query.parcours.findMany({ where: eq(parcours.statut, 'published') }),
    db.query.ecoles.findMany({ where: eq(ecoles.statut, 'published') }),
    db.query.bourses.findMany({ where: eq(bourses.statut, 'published') }),
  ]);

  return {
    parcours: pRows.map((row) => {
      const c = (row.contenu ?? {}) as ContenuParcours;
      return {
        slug: row.slug,
        titre: row.titre,
        domaine: row.domaine,
        seriesAffinite: c.seriesAffinite ?? [],
        interetsCles: c.interetsCles ?? [],
        dureeAnnees: c.dureeAnnees ?? 0,
        debouches: c.debouches ?? [],
        coutIndicatifFcfa: c.coutIndicatifFcfa ?? [0, 0],
        contenu: {
          curriculum: c.curriculum,
          temoignages: c.temoignages,
          sources: c.sources,
        },
      };
    }),
    ecoles: eRows.map((row) => ({
      nom: row.nom,
      ville: row.ville ?? '',
      type: row.type,
      fraisAnnuelsFcfa: [row.fraisMinFcfa ?? 0, row.fraisMaxFcfa ?? 0],
      estPartenaire: row.partenariat === 'active',
    })),
    bourses: bRows.map((row) => ({
      nom: row.nom,
      organisme: row.organisme ?? '',
      dateLimite: row.dateLimite ?? undefined,
      lien: row.lien ?? undefined,
    })),
  };
}
