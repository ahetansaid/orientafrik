import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { clientEnv } from '@/lib/env';
import { serverEnv } from '@/lib/env';
import type { Database } from '@/lib/supabase/types';

// Client service_role : BYPASSE LA RLS. Usage strictement réservé aux webhooks
// (Fedapay) et aux jobs admin de confiance. Ne JAMAIS l'importer côté client :
// `import 'server-only'` fait échouer le build si c'était le cas.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv().SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
