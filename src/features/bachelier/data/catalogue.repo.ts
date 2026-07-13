import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { AppError } from '@/shared/lib/errors';
import type {
  ParcoursCatalogue,
  EcoleSuggeree,
  BourseSuggeree,
} from '@/features/bachelier/domain/plan-parcours';

type DB = SupabaseClient<Database>;

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

// Lit le catalogue publié et le projette dans les formes consommées par
// `assemblerPlan`. La RLS limite déjà aux lignes `published`.
export async function chargerCatalogue(db: DB): Promise<{
  parcours: ParcoursCatalogue[];
  ecoles: EcoleSuggeree[];
  bourses: BourseSuggeree[];
}> {
  const [pRes, eRes, bRes] = await Promise.all([
    db.from('parcours').select('slug, titre, domaine, contenu').eq('statut', 'published'),
    db
      .from('ecoles')
      .select('nom, ville, type, frais_min_fcfa, frais_max_fcfa, partenariat')
      .eq('statut', 'published'),
    db.from('bourses').select('nom, organisme, date_limite, lien').eq('statut', 'published'),
  ]);

  if (pRes.error) throw new AppError('externe', 'Lecture du catalogue parcours impossible.', pRes.error);
  if (eRes.error) throw new AppError('externe', 'Lecture des écoles impossible.', eRes.error);
  if (bRes.error) throw new AppError('externe', 'Lecture des bourses impossible.', bRes.error);

  const parcours: ParcoursCatalogue[] = (pRes.data ?? []).map((row) => {
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
  });

  const ecoles: EcoleSuggeree[] = (eRes.data ?? []).map((row) => ({
    nom: row.nom,
    ville: row.ville ?? '',
    type: row.type,
    fraisAnnuelsFcfa: [row.frais_min_fcfa ?? 0, row.frais_max_fcfa ?? 0],
    estPartenaire: row.partenariat === 'active',
  }));

  const bourses: BourseSuggeree[] = (bRes.data ?? []).map((row) => ({
    nom: row.nom,
    organisme: row.organisme ?? '',
    dateLimite: row.date_limite ?? undefined,
    lien: row.lien ?? undefined,
  }));

  return { parcours, ecoles, bourses };
}
