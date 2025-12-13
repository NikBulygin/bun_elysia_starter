import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { extractUserId } from '../telegram/extractUserId';
import type { User } from '../../db/schema/users';

/**
 * Get user by username
 * If telegramUserId is missing, extracts it from Telegram API and updates DB
 */
export async function getByUsername(username: string): Promise<User | null> {
  const result = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // If telegramUserId is missing, extract and update
  if (!user.telegramUserId) {
    const telegramUserId = await extractUserId(username);
    if (telegramUserId) {
      await db.update(users)
        .set({ telegramUserId })
        .where(eq(users.telegramUserId, user.telegramUserId));
      
      return {
        ...user,
        telegramUserId,
      };
    }
  }

  return user;
}

