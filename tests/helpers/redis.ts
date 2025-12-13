import { redis } from '../../src/utils/redis/client';

/**
 * Redis test helpers
 */

/**
 * Clear all test keys from Redis
 */
export async function clearTestKeys(): Promise<void> {
  const keys = await redis.keys('test:*');
  const tgKeys = await redis.keys('tg:username:test*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  if (tgKeys.length > 0) {
    await redis.del(...tgKeys);
  }
}

/**
 * Wait for Redis to be ready
 */
export async function waitForRedis(maxRetries: number = 10): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

