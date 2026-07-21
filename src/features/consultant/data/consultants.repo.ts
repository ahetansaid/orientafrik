import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { consultants, profiles } from '@/lib/db/schema';

export type ConsultantRow = typeof consultants.$inferSelect;

export interface ConsultantPublic {
  id: string;
  nom: string;
  bio: string | null;
  specialites: string[];
  photoUrl: string | null;
}

export async function listConsultantsVerifies(db: DB): Promise<ConsultantPublic[]> {
  const rows = await db
    .select({
      id: consultants.id,
      bio: consultants.bio,
      specialites: consultants.specialites,
      photoUrl: consultants.photoUrl,
      nom: profiles.fullName,
    })
    .from(consultants)
    .innerJoin(profiles, eq(profiles.id, consultants.id))
    .where(eq(consultants.isVerified, true));

  return rows.map((c) => ({
    id: c.id,
    nom: c.nom ?? 'Consultant',
    bio: c.bio,
    specialites: Array.isArray(c.specialites) ? (c.specialites as string[]) : [],
    photoUrl: c.photoUrl,
  }));
}

export async function getConsultant(db: DB, id: string): Promise<ConsultantRow | null> {
  const row = await db.query.consultants.findFirst({ where: eq(consultants.id, id) });
  return row ?? null;
}
