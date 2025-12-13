import { redis } from './client';

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Get value from cache
 */
export async function get(key: string): Promise<string | null> {
  try {
    // Check if Redis is connected
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      return null;
    }
    return await redis.get(key);
  } catch (error) {
    // Silently fail in test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error(`Redis get error for key ${key}:`, error);
    }
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function set(key: string, value: string, ttl: number = DEFAULT_TTL): Promise<boolean> {
  try {
    // Check if Redis is connected
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      return false;
    }
    await redis.setex(key, ttl, value);
    return true;
  } catch (error) {
    // Silently fail in test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error(`Redis set error for key ${key}:`, error);
    }
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function del(key: string): Promise<boolean> {
  try {
    // Check if Redis is connected
    if (redis.status !== 'ready' && redis.status !== 'connecting') {
      return false;
    }
    await redis.del(key);
    return true;
  } catch (error) {
    // Silently fail in test environment
    if (process.env.NODE_ENV !== 'test') {
      console.error(`Redis delete error for key ${key}:`, error);
    }
    return false;
  }
}

/**
 * Delete multiple keys matching pattern
 */
export async function delPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.error(`Redis delete pattern error for ${pattern}:`, error);
    return 0;
  }
}

