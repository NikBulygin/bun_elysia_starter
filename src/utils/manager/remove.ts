import { db } from '../../db';
import { projectManagers } from '../../db/schema';
import { and, eq } from 'drizzle-orm';
import { extractUserId } from '../telegram/extractUserId';

/**
 * Remove manager from project by username
 */
export async function removeManager(projectId: number, username: string): Promise<boolean> {
  const telegramUserId = await extractUserId(username);
  if (!telegramUserId) {
    return false;
  }

  const result = await db.delete(projectManagers)
    .where(
      and(
        eq(projectManagers.projectId, projectId),
        eq(projectManagers.telegramUserId, telegramUserId)
      )
    )
    .returning();

  return result.length > 0;
}

