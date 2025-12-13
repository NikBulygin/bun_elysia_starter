import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { invalidateUsernameCache } from '../redis/username';

/**
 * Delete user by username
 * Also invalidates Redis cache
 */
export async function deleteUser(username: string): Promise<boolean> {
  const result = await db.delete(users)
    .where(eq(users.username, username))
    .returning();

  if (result.length > 0) {
    // Invalidate cache
    await invalidateUsernameCache(username);
    return true;
  }

  return false;
}

