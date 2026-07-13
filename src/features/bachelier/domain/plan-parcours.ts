// =====================================================================
// ORIENTAFRIK — Contrat de données du Plan de Parcours + moteur d'assemblage
// Le MÊME objet `PlanParcours` alimente l'infographie inline (gratuite)
// ET le PDF (payant). On assemble une fois, on rend deux fois.
// =====================================================================

// ---------- 1. Le contrat de données (source de vérité unique) ----------
export interface FiliereRecommandee {
  slug: string;
  titre: string;
  score: number;               // 0-100, compatibilité
  pourquoi: string;            // explication issue des règles (transparence)
  dureeAnnees: number;
  debouches: string[];
  coutIndicatifFcfa: [number, number];
}

export interface EcoleSuggeree {
  nom: string;
  ville: string;
  type: string;
  fraisAnnuelsFcfa: [number, number];
  estPartenaire: boolean;      // -> badge affiché (transparence, différenciateur #2)
}

export interface BourseSuggeree {
  nom: string;
  organisme: string;
  dateLimite?: string;
  lien?: string;
}

export interface EtapeCalendrier {
  quand: string;               // ex. "Semaines 1-2"
  action: string;
}

export interface PlanParcours {
  bachelier: { prenom: string; serie: string; moyenne: number };
  genereLe: string;            // ISO date
  top3: FiliereRecommandee[];  // top 3 filières
  ecoles: EcoleSuggeree[];
  bourses: BourseSuggeree[];
  calendrier: EtapeCalendrier[];
  // Champs enrichis présents UNIQUEMENT dans la version PDF payante :
  premium?: {
    curriculumParFiliere: Record<string, string[]>;    // programme semestre/semestre
    comparatifEcoles: EcoleSuggeree[];                  // cartographie détaillée
    temoignages: { auteur: string; texte: string }[];
    sources: string[];
  };
}

// ---------- 2. Profilage déterministe (B1) — règles transparentes ----------
// Aucune "boîte noire" : le score est une somme pondérée explicable.
export interface ProfilBachelier {
  serie: string;
  moyenne: number;
  interets: string[];          // ex. ['sante','sciences']
  budgetAnnuelFcfa: number;
  mobilite: 'cotonou' | 'benin' | 'uemoa' | 'international';
  ambitionInternationale: boolean;
}

// Forme (partielle) du jsonb `contenu` vérifié consommé par l'assemblage premium.
interface ParcoursContenu {
  curriculum?: string[];
  temoignages?: { auteur: string; texte: string }[];
  sources?: string[];
}

export interface ParcoursCatalogue {
  slug: string;
  titre: string;
  domaine: string;
  seriesAffinite: string[];    // séries de bac qui matchent
  interetsCles: string[];
  dureeAnnees: number;
  debouches: string[];
  coutIndicatifFcfa: [number, number];
  contenu: ParcoursContenu;    // jsonb vérifié (curriculum, stats, témoignages...)
}

export function scorerFiliere(p: ProfilBachelier, f: ParcoursCatalogue): { score: number; pourquoi: string } {
  const raisons: string[] = [];
  let score = 0;

  // Règle 1 — affinité série (40 pts)
  if (f.seriesAffinite.includes(p.serie)) { score += 40; raisons.push(`ta série ${p.serie} correspond à cette filière`); }

  // Règle 2 — recouvrement des intérêts (30 pts max, 10/intérêt)
  const communs = p.interets.filter((i) => f.interetsCles.includes(i));
  if (communs.length) { score += Math.min(30, communs.length * 10); raisons.push(`tes centres d'intérêt (${communs.join(', ')})`); }

  // Règle 3 — soutenabilité budgétaire (20 pts)
  if (p.budgetAnnuelFcfa >= f.coutIndicatifFcfa[0]) { score += 20; raisons.push(`c'est finançable avec ton budget annuel`); }
  else { raisons.push(`⚠️ coût supérieur à ton budget — à sécuriser via bourse`); }

  // Règle 4 — bonus mérite (10 pts)
  if (p.moyenne >= 12) { score += 10; raisons.push(`ta moyenne de ${p.moyenne}/20 ouvre les filières sélectives`); }

  return { score: Math.min(100, score), pourquoi: `Recommandé parce que ${raisons.join(' ; ')}.` };
}

// ---------- 3. Assemblage du Plan (déterministe, faits vérifiés) ----------
// L'IA (optionnelle) n'invente RIEN : elle ne fait que reformuler `pourquoi`
// et rédiger les transitions à partir des faits déjà sélectionnés ci-dessous.
export function assemblerPlan(
  profil: ProfilBachelier,
  prenom: string,
  catalogue: ParcoursCatalogue[],
  ecoles: EcoleSuggeree[],
  bourses: BourseSuggeree[],
  opts: { premium: boolean }
): PlanParcours {
  const classees = catalogue
    .map((f) => ({ f, ...scorerFiliere(profil, f) }))
    .sort((a, b) => b.score - a.score);

  const top3: FiliereRecommandee[] = classees.slice(0, 3).map(({ f, score, pourquoi }) => ({
    slug: f.slug, titre: f.titre, score, pourquoi,
    dureeAnnees: f.dureeAnnees, debouches: f.debouches, coutIndicatifFcfa: f.coutIndicatifFcfa,
  }));

  const plan: PlanParcours = {
    bachelier: { prenom, serie: profil.serie, moyenne: profil.moyenne },
    genereLe: new Date().toISOString().slice(0, 10),
    top3,
    ecoles: ecoles.slice(0, 6),
    bourses: bourses.slice(0, 3),
    calendrier: [
      { quand: 'Semaines 1-2', action: 'Vérifier les dates limites de candidature des 3 filières' },
      { quand: 'Semaines 2-4', action: 'Constituer le dossier des écoles ciblées' },
      { quand: 'Semaines 3-6', action: 'Déposer les demandes de bourse applicables' },
    ],
  };

  if (opts.premium) {
    plan.ecoles = ecoles; // catalogue complet en version PDF
    plan.premium = {
      curriculumParFiliere: Object.fromEntries(
        classees.slice(0, 3).map(({ f }) => [f.slug, f.contenu?.curriculum ?? []]),
      ),
      comparatifEcoles: ecoles,
      temoignages: classees[0]?.f.contenu?.temoignages ?? [],
      sources: classees[0]?.f.contenu?.sources ?? [],
    };
  }

  return plan;
}
