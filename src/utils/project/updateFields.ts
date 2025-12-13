import { db } from '../../db';
import { projects } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Project } from '../../db/schema/projects';

export interface ProjectUpdateFields {
  name?: string;
}

/**
 * Update project fields
 */
export async function updateProjectFields(id: number, fields: ProjectUpdateFields): Promise<Project | null> {
  const result = await db.update(projects)
    .set(fields)
    .where(eq(projects.id, id))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

