import { db } from '../../db';
import { stageUsers, users } from '../../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all users for a stage with username
 */
export async function getUsersByStage(stageId: number) {
  const result = await db.select({
    telegramUserId: stageUsers.telegramUserId,
    username: users.username,
    role: users.role,
  })
    .from(stageUsers)
    .innerJoin(users, eq(stageUsers.telegramUserId, users.telegramUserId))
    .where(eq(stageUsers.stageId, stageId));

  return result;
}

