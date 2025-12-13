import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { invalidateUsernameCache } from '../redis/username';
import type { User } from '../../db/schema/users';

export interface UserUpdateFields {
  role?: 'admin' | 'manager' | 'none';
  username?: string;
}

/**
 * Update user fields by username
 * Invalidates cache if username changed
 */
export async function updateFields(username: string, fields: UserUpdateFields): Promise<User | null> {
  const user = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const oldUsername = user[0].username;

  const result = await db.update(users)
    .set(fields)
    .where(eq(users.username, username))
    .returning();

  // Invalidate cache if username changed
  if (fields.username && fields.username !== oldUsername) {
    await invalidateUsernameCache(oldUsername);
    await invalidateUsernameCache(fields.username);
  }

  return result[0];
}

