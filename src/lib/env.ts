import { z } from 'zod';

// Validation des variables d'environnement au démarrage : on échoue vite et
// clairement plutôt que de crasher à la première requête sur une clé absente.
// Les clés NEXT_PUBLIC_* sont accessibles côté client ; les autres sont server-only.

const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
});

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  FEDAPAY_SECRET_KEY: z.string().optional(),
  FEDAPAY_PUBLIC_KEY: z.string().optional(),
  FEDAPAY_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  // Envoi d'email transactionnel (OTP) via SMTP — ex. Gmail.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

// Côté client, seules les NEXT_PUBLIC_* sont réellement inlinées par Next.
export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
});

// Accès paresseux au bloc serveur (évite de faire échouer un rendu client sur une clé server-only).
let _serverEnv: z.infer<typeof serverSchema> | null = null;
export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== 'undefined') {
    throw new Error('serverEnv() ne doit être appelé que côté serveur.');
  }
  if (!_serverEnv) {
    _serverEnv = serverSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      FEDAPAY_SECRET_KEY: process.env.FEDAPAY_SECRET_KEY,
      FEDAPAY_PUBLIC_KEY: process.env.FEDAPAY_PUBLIC_KEY,
      FEDAPAY_WEBHOOK_SECRET: process.env.FEDAPAY_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      EMAIL_FROM: process.env.EMAIL_FROM,
      SENTRY_DSN: process.env.SENTRY_DSN,
    });
  }
  return _serverEnv;
}
