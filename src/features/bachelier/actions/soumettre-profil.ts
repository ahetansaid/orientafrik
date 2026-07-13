'use server';
import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireUser } from '@/lib/auth/guards';
import { fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { profilSchema, versProfilBachelier } from '@/features/bachelier/domain/profil.schema';
import { assemblerPlan, scorerFiliere } from '@/features/bachelier/domain/plan-parcours';
import { chargerCatalogue } from '@/features/bachelier/data/catalogue.repo';
import { insererProfil } from '@/features/bachelier/data/profils.repo';
import { insererPlan } from '@/features/bachelier/data/plans.repo';

// B1 -> B3 : valide le profil, lit le catalogue, assemble le plan (gratuit) et
// persiste profil + plan, puis redirige vers l'infographie.
export async function soumettreProfil(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profilSchema.safeParse({
    prenom: formData.get('prenom'),
    serie: formData.get('serie'),
    moyenne: formData.get('moyenne'),
    interets: formData.getAll('interets'),
    budgetAnnuelFcfa: formData.get('budgetAnnuelFcfa'),
    mobilite: formData.get('mobilite'),
    ambitionInternationale: formData.get('ambitionInternationale') === 'on',
  });

  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Formulaire invalide.');
  }

  let planId: string;
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const profil = versProfilBachelier(parsed.data);

    const { parcours, ecoles, bourses } = await chargerCatalogue(supabase);
    if (parcours.length === 0) {
      return fail('introuvable', 'Le catalogue de parcours est momentanément indisponible.');
    }

    // Scores explicables {slug: score} — transparence (stockés sur le profil).
    const scores: Record<string, number> = {};
    for (const f of parcours) scores[f.slug] = scorerFiliere(profil, f).score;

    const plan = assemblerPlan(profil, parsed.data.prenom, parcours, ecoles, bourses, {
      premium: false,
    });

    const profilId = await insererProfil(supabase, user.id, parsed.data, scores);
    const parcoursPrincipalSlug = plan.top3[0]?.slug ?? null;
    planId = await insererPlan(supabase, {
      bachelierId: user.id,
      profilId,
      // parcours_principal_id référence parcours.id (uuid). On le laisse null en MVP :
      // le slug suffit à l'affichage ; le lien fort sera câblé quand utile.
      parcoursPrincipalId: null,
      data: plan,
    });
    void parcoursPrincipalSlug;
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', "Impossible de générer ton plan pour le moment.");
  }

  redirect(`/plan/${planId}`);
}
