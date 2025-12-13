import { get, set, del } from './cache';

const USERNAME_TO_ID_KEY = (username: string) => `tg:username:${username}:user_id`;
const TTL = 3600; // 1 hour

/**
 * Get telegramUserId from cache by username
 */
export async function getUserIdByUsername(username: string): Promise<number | null> {
  const key = USERNAME_TO_ID_KEY(username);
  const cached = await get(key);
  if (cached) {
    return parseInt(cached, 10);
  }
  return null;
}

/**
 * Cache telegramUserId by username
 */
export async function cacheUserIdByUsername(username: string, telegramUserId: number): Promise<boolean> {
  const key = USERNAME_TO_ID_KEY(username);
  return await set(key, telegramUserId.toString(), TTL);
}

/**
 * Invalidate cache for username
 */
export async function invalidateUsernameCache(username: string): Promise<boolean> {
  const key = USERNAME_TO_ID_KEY(username);
  return await del(key);
}

