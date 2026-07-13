import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env';
import type { Database } from '@/lib/supabase/types';

// Client Supabase à session utilisateur : la RLS s'applique. À utiliser dans les
// RSC, Server Actions et la plupart des route handlers. C'est le client par défaut.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Appelé depuis un Server Component : l'écriture de cookies est ignorée.
            // Le refresh de session est assuré par le middleware.
          }
        },
      },
    },
  );
}
