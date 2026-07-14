import { test, expect } from '@playwright/test';
import {
  supabaseConfigured,
  createUser,
  deleteUser,
  signIn,
  setRole,
  rest,
  rpc,
  uniqueEmail,
  SERVICE,
} from './helpers/supabase';

// Assertions de sécurité au niveau API (RLS + privilèges colonne). Reproduit en
// tests répétables la revue de SECURITY.md. Ignoré si Supabase n'est pas configuré.
test.describe('Sécurité — RLS & privilèges colonne', () => {
  test.skip(!supabaseConfigured, 'Supabase non configuré (.env.local absent)');

  let aId = '';
  let bId = '';
  let admId = '';
  let aTok = '';
  let bTok = '';
  let planId = '';
  const slug = `e2e-${Date.now()}`;

  test.beforeAll(async () => {
    const aEmail = uniqueEmail('a');
    const bEmail = uniqueEmail('b');
    const admEmail = uniqueEmail('adm');

    aId = await createUser(aEmail, 'Aicha Test');
    bId = await createUser(bEmail, 'Kevin Test');
    admId = await createUser(admEmail, 'Admin Test');
    aTok = await signIn(aEmail);
    bTok = await signIn(bEmail);
    await setRole(admId, 'admin');

    // A crée son profil + son plan (écritures autorisées par la RLS + colonnes).
    const profil = await rest('bachelier_profils', {
      token: aTok,
      method: 'POST',
      prefer: 'return=representation',
      body: {
        bachelier_id: aId,
        serie_bac: 'C',
        moyenne: 14,
        interets: ['sante'],
        budget_annuel_fcfa: 300000,
        mobilite: 'benin',
        scores: { medecine: 90 },
      },
    });
    const profilId = (profil.json as { id: string }[])[0]!.id;

    const plan = await rest('plans_parcours', {
      token: aTok,
      method: 'POST',
      prefer: 'return=representation',
      body: {
        bachelier_id: aId,
        profil_id: profilId,
        data: {
          bachelier: { prenom: 'Aicha', serie: 'C', moyenne: 14 },
          genereLe: '2026-07-14',
          top3: [{ slug: 'medecine', titre: 'Medecine', score: 90, pourquoi: 'ok' }],
        },
      },
    });
    planId = (plan.json as { id: string }[])[0]!.id;

    await rest(`plans_parcours?id=eq.${planId}`, {
      token: aTok,
      method: 'PATCH',
      body: { share_slug: slug, shared_at: new Date().toISOString() },
    });
  });

  test.afterAll(async () => {
    // Nettoyage des fixtures (best-effort).
    await Promise.all([deleteUser(aId), deleteUser(bId), deleteUser(admId)]);
  });

  test('le partage public ne divulgue que prénom + top3 (non-PII)', async () => {
    const { json } = await rpc('get_shared_plan', { _slug: slug });
    const plan = json as Record<string, unknown> | null;
    expect(plan?.prenom).toBe('Aicha');
    expect(plan).not.toHaveProperty('email');
    expect(plan).not.toHaveProperty('moyenne');
  });

  test('un bachelier ne peut pas lire le plan d’un autre (RLS)', async () => {
    const { json } = await rest(`plans_parcours?id=eq.${planId}&select=id`, { token: bTok });
    expect(Array.isArray(json) ? json.length : -1).toBe(0);
  });

  test('anon ne voit aucun plan en direct', async () => {
    const { json } = await rest('plans_parcours?select=id');
    expect(Array.isArray(json) ? json.length : -1).toBe(0);
  });

  test('un bachelier ne peut PAS passer son plan à is_paid=true', async () => {
    await rest(`plans_parcours?id=eq.${planId}`, {
      token: aTok,
      method: 'PATCH',
      body: { is_paid: true },
    });
    // Vérifie l'état réel via service_role : toujours false.
    const { json } = await rest(`plans_parcours?id=eq.${planId}&select=is_paid`, { token: SERVICE });
    expect((json as { is_paid: boolean }[])[0]!.is_paid).toBe(false);
  });

  test('un utilisateur ne peut PAS s’auto-promouvoir admin', async () => {
    await rest(`profiles?id=eq.${bId}`, { token: bTok, method: 'PATCH', body: { role: 'admin' } });
    const { json } = await rest(`profiles?id=eq.${bId}&select=role`, { token: SERVICE });
    expect((json as { role: string }[])[0]!.role).toBe('bachelier');
  });

  test('un bachelier PEUT s’orienter (statut orientee)', async () => {
    const { json: ecoles } = await rest('ecoles?slug=eq.esgis&select=id', { token: SERVICE });
    const ecoleId = (ecoles as { id: string }[])[0]!.id;
    const res = await rest('inscriptions_ecole', {
      token: aTok,
      method: 'POST',
      prefer: 'return=representation',
      body: { bachelier_id: aId, ecole_id: ecoleId },
    });
    expect(res.status).toBeLessThan(300);
    expect((res.json as { statut: string }[])[0]!.statut).toBe('orientee');
  });

  test('un bachelier ne peut PAS se déclarer inscrit', async () => {
    const { json: ecoles } = await rest('ecoles?slug=eq.esgis&select=id', { token: SERVICE });
    const ecoleId = (ecoles as { id: string }[])[0]!.id;
    const res = await rest('inscriptions_ecole', {
      token: aTok,
      method: 'POST',
      prefer: 'return=representation',
      body: { bachelier_id: aId, ecole_id: ecoleId, statut: 'inscrite' },
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
