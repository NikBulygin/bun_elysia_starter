import { db } from '../../db';
import { projects, projectManagers, stageUsers, stages, users } from '../../db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import type { Project } from '../../db/schema/projects';

/**
 * Get all projects (no filtering)
 */
export async function getAllProjects(): Promise<Project[]> {
  return await db.select().from(projects);
}

/**
 * Get projects with filtering by user role and pagination
 * 
 * @param telegramUserId - User's Telegram ID
 * @param userRole - User's role ('admin', 'manager', 'none')
 * @param offset - Pagination offset
 * @param limit - Pagination limit
 * @returns Object with projects array and total count
 */
export async function getProjectsWithAccess(
  telegramUserId: number,
  userRole: 'admin' | 'manager' | 'none',
  offset: number = 0,
  limit: number = 10
): Promise<{ projects: Project[]; total: number }> {
  // Admin sees all projects
  if (userRole === 'admin') {
    const allProjects = await db.select().from(projects);
    const total = allProjects.length;
    const paginatedProjects = allProjects.slice(offset, offset + limit);
    return { projects: paginatedProjects, total };
  }

  // Manager sees only projects where they are assigned as manager
  if (userRole === 'manager') {
    const managerProjects = await db
      .select({ project: projects })
      .from(projects)
      .innerJoin(projectManagers, eq(projects.id, projectManagers.projectId))
      .where(eq(projectManagers.telegramUserId, telegramUserId));

    const total = managerProjects.length;
    const paginatedProjects = managerProjects
      .slice(offset, offset + limit)
      .map(p => p.project);

    return { projects: paginatedProjects, total };
  }

  // None role: sees only projects where they participate through stages
  // Get all stage IDs where user is assigned
  const userStages = await db
    .select({ stageId: stageUsers.stageId })
    .from(stageUsers)
    .where(eq(stageUsers.telegramUserId, telegramUserId));

  if (userStages.length === 0) {
    return { projects: [], total: 0 };
  }

  const stageIds = userStages.map(s => s.stageId);

  // Get projects that have these stages
  const projectsWithStagesRaw = await db
    .select({ 
      id: projects.id,
      name: projects.name,
    })
    .from(projects)
    .innerJoin(stages, eq(projects.id, stages.projectId))
    .where(inArray(stages.id, stageIds));

  // Remove duplicates by project ID
  const uniqueProjectsMap = new Map<number, Project>();
  for (const p of projectsWithStagesRaw) {
    if (!uniqueProjectsMap.has(p.id)) {
      uniqueProjectsMap.set(p.id, p as Project);
    }
  }

  const uniqueProjects = Array.from(uniqueProjectsMap.values());
  const total = uniqueProjects.length;
  const paginatedProjects = uniqueProjects.slice(offset, offset + limit);

  return { projects: paginatedProjects, total };
}

