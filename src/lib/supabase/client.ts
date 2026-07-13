'use client';
import { createBrowserClient } from '@supabase/ssr';
import { clientEnv } from '@/lib/env';
import type { Database } from '@/lib/supabase/types';

// Client navigateur (clé anon, RLS active). Réservé à l'interactivité côté client :
// realtime, UI optimiste. Les lectures/écritures sensibles passent par le serveur.
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
