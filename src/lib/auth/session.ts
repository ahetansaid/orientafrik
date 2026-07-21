import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth, ensureProfile } from '@/lib/auth';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import type { UserRole } from '@/lib/db/enums';

export type Profile = typeof profiles.$inferSelect;

// getUser / getProfile en cache() : une lecture par cycle de rendu, réutilisée
// par le layout, la page et les actions d'une même requête.
export const getUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const p = await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) });
  // Filet : crée le profil s'il manque (ex. hook manqué).
  return p ?? (await ensureProfile(user.id, user.email, user.name)) ?? null;
});

export async function getRole(): Promise<UserRole | null> {
  const profile = await getProfile();
  return profile?.role ?? null;
}
