import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@/lib/db/schema';

// Client Drizzle « admin » sur Neon (rôle propriétaire — équivalent de l'ancien
// service_role : bypasse la RLS). Réservé aux webhooks et jobs de confiance.
// Le client RLS-aware (par utilisateur, via JWT Stack + Neon Authorize) est
// fourni séparément (voir dbAuth, phase RLS).
const connectionString = process.env.DATABASE_URL ?? '';
const sqlClient = neon(connectionString);

export const db = drizzle(sqlClient, { schema });
export type DB = typeof db;
