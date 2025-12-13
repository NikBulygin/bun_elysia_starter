import { db } from '../../db';
import { stages } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Stage } from '../../db/schema/stages';

/**
 * Get all stages for a project
 */
export async function getStagesByProject(projectId: number): Promise<Stage[]> {
  return await db.select()
    .from(stages)
    .where(eq(stages.projectId, projectId));
}

