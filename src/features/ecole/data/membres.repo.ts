import 'server-only';
import { eq } from 'drizzle-orm';
import type { DB } from '@/lib/db';
import { ecoleMembres } from '@/lib/db/schema';

// École rattachée à un membre staff (un membre = une école en MVP).
export async function getEcoleIdPourUser(db: DB, userId: string): Promise<string | null> {
  const row = await db.query.ecoleMembres.findFirst({
    where: eq(ecoleMembres.userId, userId),
    columns: { ecoleId: true },
  });
  return row?.ecoleId ?? null;
}
