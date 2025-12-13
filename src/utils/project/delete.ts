import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Delete project by id
 */
export async function deleteProject(id: number): Promise<boolean> {
  const result = await db.delete(projects)
    .where(eq(projects.id, id))
    .returning();

  return result.length > 0;
}

