import { db } from '../../db';
import { stages } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Stage } from '../../db/schema/stages';

export interface StageUpdateFields {
  name?: string;
  projectId?: number;
}

/**
 * Update stage fields
 */
export async function updateStageFields(id: number, fields: StageUpdateFields): Promise<Stage | null> {
  const result = await db.update(stages)
    .set(fields)
    .where(eq(stages.id, id))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

