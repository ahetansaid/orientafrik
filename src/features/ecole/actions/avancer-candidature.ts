'use server';
import 'server-only';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { assertRole } from '@/lib/auth/guards';
import { ok, fail, type ActionResult } from '@/shared/lib/result';
import { isAppError } from '@/shared/lib/errors';
import { avancerSchema } from '@/features/ecole/domain/cpa.schema';
import { transitionAutorisee, commissionInscription } from '@/features/ecole/domain/cpa';
import { getEcoleIdPourUser } from '@/features/ecole/data/membres.repo';
import { getEcole } from '@/features/ecole/data/ecoles.repo';
import { getInscription, avancerStatut } from '@/features/ecole/data/inscriptions.repo';

// Un membre école fait avancer une candidature. Le passage à `inscrite` fige la
// commission due (confirmed_by = membre). La RLS restreint à l'école du membre.
export async function avancerCandidature(input: unknown): Promise<ActionResult> {
  const parsed = avancerSchema.safeParse(input);
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Requête invalide.');
  }

  try {
    const profil = await assertRole('ecole');
    const supabase = await createClient();
    const ecoleId = await getEcoleIdPourUser(supabase, profil.id);
    if (!ecoleId) return fail('non_autorise', 'Aucune école rattachée à ton compte.');

    const inscription = await getInscription(supabase, parsed.data.inscriptionId);
    if (!inscription || inscription.ecole_id !== ecoleId) {
      return fail('introuvable', 'Candidature introuvable.');
    }
    if (!transitionAutorisee(inscription.statut, parsed.data.statut)) {
      return fail('conflit', `Transition ${inscription.statut} → ${parsed.data.statut} interdite.`);
    }

    let commissionFcfa: number | null = null;
    if (parsed.data.statut === 'inscrite') {
      const ecole = await getEcole(supabase, ecoleId);
      commissionFcfa = commissionInscription(ecole?.commission_min_fcfa ?? null);
    }

    await avancerStatut(supabase, parsed.data.inscriptionId, parsed.data.statut, {
      commissionFcfa,
      confirmedBy: profil.id,
    });
    revalidatePath('/ecole/candidatures');
    return ok(undefined);
  } catch (e) {
    if (isAppError(e)) return fail(e.code, e.message);
    return fail('inconnu', 'Avancement impossible pour le moment.');
  }
}
