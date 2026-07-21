import 'server-only';
import { eq, desc, asc } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import {
  profiles,
  consultants,
  ecoleMembres,
  parcours,
  ecoles,
  bourses,
  payments,
} from '@/lib/db/schema';
import type { UserRole, ContenuStatut } from '@/lib/db/enums';
import type { PartenariatValues } from '@/features/admin/domain/admin.schema';

export type ProfileRow = typeof profiles.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;

// ---- Utilisateurs & rôles ----
export async function listProfiles(db: DB): Promise<ProfileRow[]> {
  return db.select().from(profiles).orderBy(desc(profiles.createdAt));
}

export async function definirRole(db: DB, userId: string, role: UserRole): Promise<void> {
  await db.update(profiles).set({ role, updatedAt: new Date() }).where(eq(profiles.id, userId));
}

export async function creerConsultantSiAbsent(db: DB, userId: string): Promise<void> {
  await db.insert(consultants).values({ id: userId, isVerified: true }).onConflictDoNothing();
}

export async function rattacherMembre(
  db: DB,
  ecoleId: string,
  userId: string,
  roleEcole: string,
): Promise<void> {
  await db
    .insert(ecoleMembres)
    .values({ ecoleId, userId, roleEcole })
    .onConflictDoUpdate({
      target: [ecoleMembres.ecoleId, ecoleMembres.userId],
      set: { roleEcole },
    });
}

// ---- Contenu (toutes lignes, tous statuts) ----
export async function listParcours(db: DB) {
  return db
    .select({ id: parcours.id, titre: parcours.titre, slug: parcours.slug, statut: parcours.statut })
    .from(parcours)
    .orderBy(asc(parcours.titre));
}

export async function listEcoles(db: DB) {
  return db
    .select({
      id: ecoles.id,
      nom: ecoles.nom,
      slug: ecoles.slug,
      statut: ecoles.statut,
      partenariat: ecoles.partenariat,
      commissionMinFcfa: ecoles.commissionMinFcfa,
      commissionMaxFcfa: ecoles.commissionMaxFcfa,
    })
    .from(ecoles)
    .orderBy(asc(ecoles.nom));
}

export async function listBourses(db: DB) {
  return db
    .select({ id: bourses.id, nom: bourses.nom, statut: bourses.statut })
    .from(bourses)
    .orderBy(asc(bourses.nom));
}

export async function publierContenu(
  db: DB,
  type: 'parcours' | 'ecoles' | 'bourses',
  id: string,
  statut: ContenuStatut,
): Promise<void> {
  if (type === 'parcours') await db.update(parcours).set({ statut }).where(eq(parcours.id, id));
  else if (type === 'ecoles') await db.update(ecoles).set({ statut }).where(eq(ecoles.id, id));
  else await db.update(bourses).set({ statut }).where(eq(bourses.id, id));
}

// ---- Partenariat & commission école ----
export async function majPartenariat(db: DB, v: PartenariatValues): Promise<void> {
  await db
    .update(ecoles)
    .set({
      partenariat: v.partenariat,
      commissionMinFcfa: v.commissionMinFcfa ?? null,
      commissionMaxFcfa: v.commissionMaxFcfa ?? null,
      updatedAt: new Date(),
    })
    .where(eq(ecoles.id, v.ecoleId));
}

// ---- Paiements (lecture) ----
export async function listPaiements(db: DB): Promise<PaymentRow[]> {
  return db.select().from(payments).orderBy(desc(payments.createdAt)).limit(200);
}
