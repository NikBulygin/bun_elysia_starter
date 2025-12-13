import { db } from '../../db';
import { projects } from '../../db/schema';
import type { Project, NewProject } from '../../db/schema/projects';

/**
 * Create new project
 */
export async function createProject(data: NewProject): Promise<Project> {
  const result = await db.insert(projects)
    .values(data)
    .returning();

  return result[0];
}

