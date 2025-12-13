import { db } from '../../db';
import { projectManagers, users } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all managers for a project with username
 */
export async function getManagersByProject(projectId: number) {
  const result = await db.select({
    telegramUserId: projectManagers.telegramUserId,
    username: users.username,
    role: users.role,
  })
    .from(projectManagers)
    .innerJoin(users, eq(projectManagers.telegramUserId, users.telegramUserId))
    .where(eq(projectManagers.projectId, projectId));

  return result;
}

