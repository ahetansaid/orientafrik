import 'server-only';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { nextCookies } from 'better-auth/next-js';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import * as authSchema from '@/lib/db/auth-schema';
import { envoyerOTP } from '@/lib/email/send-otp';

// Better Auth — auth « email-first » (OTP), stockée dans Neon via Drizzle.
// Aucun service externe : les tables user/session/... vivent dans notre base.
// À la création d'un utilisateur, on crée sa ligne `profiles` (rôle métier).
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema: authSchema }),
  // Pas de mot de passe : uniquement OTP par email.
  emailAndPassword: { enabled: false },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 min
      async sendVerificationOTP({ email, otp }) {
        await envoyerOTP(email, otp);
      },
    }),
    nextCookies(), // doit rester le dernier plugin
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (u) => {
          // Crée le profil métier (rôle par défaut : bachelier).
          await db
            .insert(profiles)
            .values({ id: u.id, email: u.email, fullName: u.name })
            .onConflictDoNothing();
        },
      },
    },
  },
});

// Assure la présence d'un profil pour l'utilisateur courant (filet de sécurité si
// le hook de création a été manqué). Renvoie le profil.
export async function ensureProfile(userId: string, email?: string, name?: string) {
  const existing = await db.query.profiles.findFirst({ where: eq(profiles.id, userId) });
  if (existing) return existing;
  const [row] = await db
    .insert(profiles)
    .values({ id: userId, email: email ?? null, fullName: name ?? null })
    .onConflictDoNothing()
    .returning();
  return row ?? (await db.query.profiles.findFirst({ where: eq(profiles.id, userId) }));
}
