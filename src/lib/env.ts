import { z } from 'zod';

// Validation des variables d'environnement au démarrage : on échoue vite et
// clairement plutôt que de crasher à la première requête sur une clé absente.
// Les clés NEXT_PUBLIC_* sont accessibles côté client ; les autres sont server-only.

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  FEDAPAY_SECRET_KEY: z.string().optional(),
  FEDAPAY_PUBLIC_KEY: z.string().optional(),
  FEDAPAY_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

// Côté client, seules les NEXT_PUBLIC_* sont réellement inlinées par Next :
// on ne référence donc que celles-là dans clientEnv.
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});

// Accès paresseux au bloc serveur : n'est parsé que lorsqu'on l'appelle depuis
// un contexte serveur (évite de faire échouer un rendu client sur une clé server-only).
let _serverEnv: z.infer<typeof serverSchema> | null = null;
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() ne doit être appelé que côté serveur.');
  }
  if (!_serverEnv) {
    _serverEnv = serverSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      FEDAPAY_SECRET_KEY: process.env.FEDAPAY_SECRET_KEY,
      FEDAPAY_PUBLIC_KEY: process.env.FEDAPAY_PUBLIC_KEY,
      FEDAPAY_WEBHOOK_SECRET: process.env.FEDAPAY_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      SENTRY_DSN: process.env.SENTRY_DSN,
    });
  }
  return _serverEnv;
}
