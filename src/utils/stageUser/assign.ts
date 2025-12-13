import { db } from '../../db';
import { stageUsers } from '../../db/schema';
import { extractUserId } from '../telegram/extractUserId';

/**
 * Assign user to stage by username
 */
export async function assignUserToStage(stageId: number, username: string): Promise<boolean> {
  const telegramUserId = await extractUserId(username);
  if (!telegramUserId) {
    return false;
  }

  try {
    await db.insert(stageUsers)
      .values({
        stageId,
        telegramUserId,
      });
    return true;
  } catch (error) {
    // Handle duplicate key error (already assigned)
    return false;
  }
}

