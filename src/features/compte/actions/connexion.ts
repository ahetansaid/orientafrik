'use server';
import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Déconnexion (Better Auth). L'envoi/vérification d'OTP se fait côté client via
// authClient (voir pages connexion/verifier).
export async function seDeconnecter(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect('/');
}
