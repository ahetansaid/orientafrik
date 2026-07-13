'use server';
import 'server-only';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { clientEnv } from '@/lib/env';
import { ok, fail, type ActionResult } from '@/shared/lib/result';

const emailSchema = z.object({ email: z.string().email('Adresse email invalide.') });
const otpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Le code doit contenir 6 chiffres.'),
});

// Demande un OTP / magic link par email (email-first, sans mot de passe).
export async function demanderOtp(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = emailSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Email invalide.');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error) return fail('externe', "Envoi du code impossible. Réessaie dans un instant.");
  return ok(undefined);
}

// Vérifie le code OTP saisi à la main (alternative au clic sur le lien magique).
export async function verifierOtp(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = otpSchema.safeParse({
    email: formData.get('email'),
    code: formData.get('code'),
  });
  if (!parsed.success) {
    return fail('validation', parsed.error.issues[0]?.message ?? 'Code invalide.');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: 'email',
  });

  if (error) return fail('non_autorise', 'Code incorrect ou expiré.');
  return ok(undefined);
}

export async function seDeconnecter(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
