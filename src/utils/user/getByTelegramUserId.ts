import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '../../db/schema/users';

/**
 * Get user by telegramUserId (for internal use in relations)
 */
export async function getByTelegramUserId(telegramUserId: number): Promise<User | null> {
  const result = await db.select()
    .from(users)
    .where(eq(users.telegramUserId, telegramUserId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

