// Helpers d'API Supabase pour les tests E2E de sécurité.
// Les comptes créés ici sont des FIXTURES de test (créés puis supprimés dans le
// test) — ce ne sont pas des seeders applicatifs.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Les specs d'API sont ignorées si l'env Supabase n'est pas configuré.
export const supabaseConfigured = Boolean(SUPABASE_URL && ANON && SERVICE);

const PASSWORD = 'Test-Password-123!';

export async function createUser(email: string, fullName: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    }),
  });
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error(`createUser a échoué: ${JSON.stringify(json)}`);
  return json.id;
}

export async function deleteUser(id: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: 'DELETE',
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
  });
}

export async function signIn(email: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error(`signIn a échoué: ${JSON.stringify(json)}`);
  return json.access_token;
}

// Met à jour le rôle d'un profil via service_role (setup admin de test).
export async function setRole(userId: string, role: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}

interface RestOpts {
  token?: string; // JWT utilisateur ; sinon anon
  method?: string;
  body?: unknown;
  prefer?: string;
}

// Appel PostgREST avec le rôle anon ou un JWT utilisateur (RLS appliquée).
export async function rest(path: string, opts: RestOpts = {}) {
  const { token, method = 'GET', body, prefer } = opts;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token ?? ANON}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    /* réponse vide */
  }
  return { status: res.status, json };
}

export async function rpc(fn: string, args: Record<string, unknown>, token?: string) {
  return rest(`rpc/${fn}`, { method: 'POST', body: args, token });
}

export function uniqueEmail(prefix: string): string {
  return `e2e-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.bj`;
}
