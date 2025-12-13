import { db } from '../../db';
import { stages } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Delete stage by id
 */
export async function deleteStage(id: number): Promise<boolean> {
  const result = await db.delete(stages)
    .where(eq(stages.id, id))
    .returning();

  return result.length > 0;
}

