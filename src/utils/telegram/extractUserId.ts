import { getUserByUsername } from './getUserByUsername';
import { getUserIdByUsername, cacheUserIdByUsername } from '../redis/username';

/**
 * Extract telegramUserId from username with caching
 * First checks Redis cache, then Telegram API if not cached
 */
export async function extractUserId(username: string): Promise<number | null> {
  // Check cache first
  const cached = await getUserIdByUsername(username);
  if (cached !== null) {
    return cached;
  }

  // Fetch from Telegram API
  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  // Cache the result
  await cacheUserIdByUsername(username, user.id);

  return user.id;
}

