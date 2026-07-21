import { defineConfig } from 'drizzle-kit';

// Config Drizzle Kit (génération/application des migrations).
// Utilise la connexion DIRECTE (non-poolée) pour le DDL.
export default defineConfig({
  schema: ['./src/lib/db/schema.ts', './src/lib/db/auth-schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
