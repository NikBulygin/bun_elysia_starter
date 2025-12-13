import { db } from '../../db';
import { projectManagers } from '../../db/schema';
import { extractUserId } from '../telegram/extractUserId';
import type { NewProjectManager } from '../../db/schema/projectManagers';

/**
 * Assign manager to project by username
 * Extracts telegramUserId from username
 */
export async function assignManager(projectId: number, username: string): Promise<boolean> {
  const telegramUserId = await extractUserId(username);
  if (!telegramUserId) {
    return false;
  }

  try {
    await db.insert(projectManagers)
      .values({
        projectId,
        telegramUserId,
      });
    return true;
  } catch (error) {
    // Handle duplicate key error (already assigned)
    return false;
  }
}

