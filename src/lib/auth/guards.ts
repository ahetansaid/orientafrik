import 'server-only';
import { redirect } from 'next/navigation';
import { getProfile, getUser, type Profile } from '@/lib/auth/session';
import type { UserRole } from '@/lib/supabase/types';

// Destination par défaut de chaque rôle après connexion / en cas de mauvais rôle.
export const HOME_BY_ROLE: Record<UserRole, string> = {
  bachelier: '/profil',
  ecole: '/ecole/tableau-de-bord',
  consultant: '/consultant/tableau-de-bord',
  admin: '/admin/tableau-de-bord',
};

// Exige un utilisateur connecté ; sinon -> /connexion.
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect('/connexion');
  return user;
}

// Frontière serveur : exige un rôle précis. Combinée à la RLS Postgres, c'est la
// garde réelle (le middleware n'est qu'un premier filtre). Renvoie le profil validé.
export async function assertRole(role: UserRole): Promise<Profile> {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect('/connexion');
  if (profile.role !== role) redirect(HOME_BY_ROLE[profile.role]);
  return profile;
}
