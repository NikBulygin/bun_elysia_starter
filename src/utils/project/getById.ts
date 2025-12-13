import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Project } from '../../db/schema/projects';

/**
 * Get project by id
 */
export async function getProjectById(id: number): Promise<Project | null> {
  const result = await db.select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

