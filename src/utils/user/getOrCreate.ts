import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { validateUser } from '../telegram/validateUser';
import { extractUserId } from '../telegram/extractUserId';
import type { User, NewUser } from '../../db/schema/users';

/**
 * Get or create user by username
 * Validates user exists in Telegram, extracts telegramUserId, creates if not exists in DB
 */
export async function getOrCreate(username: string): Promise<User | null> {
  // Validate user exists in Telegram
  const isValid = await validateUser(username);
  if (!isValid) {
    return null;
  }

  // Extract telegramUserId
  const telegramUserId = await extractUserId(username);
  if (!telegramUserId) {
    return null;
  }

  // Check if user exists in DB
  const existing = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new user with role='none'
  const newUser: NewUser = {
    telegramUserId,
    username,
    role: 'none',
  };

  const result = await db.insert(users)
    .values(newUser)
    .returning();

  return result[0];
}

