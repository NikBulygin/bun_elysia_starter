import { db } from '../../db';
import { stages } from '../../db/schema';
import type { Stage, NewStage } from '../../db/schema/stages';

/**
 * Create new stage
 */
export async function createStage(data: NewStage): Promise<Stage> {
  const result = await db.insert(stages)
    .values(data)
    .returning();

  return result[0];
}

