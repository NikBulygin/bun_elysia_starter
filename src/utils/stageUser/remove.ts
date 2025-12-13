import { db } from '../../db';
import { stageUsers } from '../../db/schema';
import { and, eq } from 'drizzle-orm';
import { extractUserId } from '../telegram/extractUserId';

/**
 * Remove user from stage by username
 */
export async function removeUserFromStage(stageId: number, username: string): Promise<boolean> {
  const telegramUserId = await extractUserId(username);
  if (!telegramUserId) {
    return false;
  }

  const result = await db.delete(stageUsers)
    .where(
      and(
        eq(stageUsers.stageId, stageId),
        eq(stageUsers.telegramUserId, telegramUserId)
      )
    )
    .returning();

  return result.length > 0;
}

