import { db } from '../../db';
import { providers } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Delete provider by id
 */
export async function deleteProvider(id: number): Promise<boolean> {
  const result = await db.delete(providers)
    .where(eq(providers.id, id))
    .returning();

  return result.length > 0;
}

