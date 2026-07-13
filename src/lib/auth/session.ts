import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Database, UserRole } from '@/lib/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// getUser / getProfile enrobés dans cache() : une seule requête par cycle de
// rendu, réutilisée par le layout, la page et les actions d'une même requête.

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data ?? null;
});

export async function getRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  return profile?.role ?? null;
}
