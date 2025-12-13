import { db } from '../../db';
import { stages } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Stage } from '../../db/schema/stages';

/**
 * Get stage by id
 */
export async function getStageById(id: number): Promise<Stage | null> {
  const result = await db.select()
    .from(stages)
    .where(eq(stages.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

