// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { getUserIdByUsername, cacheUserIdByUsername, invalidateUsernameCache } from '../../../src/utils/redis/username';
import { redis } from '../../../src/utils/redis/client';

describe('Redis Username Utils', () => {
  beforeAll(async () => {
    // Wait for Redis to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        await redis.ping();
        break;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
    }
  });

  afterAll(async () => {
    await redis.quit();
  });

  beforeEach(async () => {
    // Clean up test keys
    await redis.del('tg:username:testuser:user_id', 'tg:username:Bulygin_Nik:user_id');
  });

  test('should cache and retrieve telegramUserId by username', async () => {
    const username = 'testuser';
    const telegramUserId = 123456789;
    
    // Cache the user ID
    const cacheResult = await cacheUserIdByUsername(username, telegramUserId);
    expect(cacheResult).toBe(true);
    
    // Retrieve from cache
    const retrieved = await getUserIdByUsername(username);
    expect(retrieved).toBe(telegramUserId);
  });

  test('should return null for non-cached username', async () => {
    const result = await getUserIdByUsername('nonexistent');
    expect(result).toBeNull();
  });

  test('should invalidate username cache', async () => {
    const username = 'testuser';
    const telegramUserId = 123456789;
    
    // Cache the user ID
    await cacheUserIdByUsername(username, telegramUserId);
    expect(await getUserIdByUsername(username)).toBe(telegramUserId);
    
    // Invalidate cache
    const invalidateResult = await invalidateUsernameCache(username);
    expect(invalidateResult).toBe(true);
    
    // Verify cache is cleared
    const afterInvalidate = await getUserIdByUsername(username);
    expect(afterInvalidate).toBeNull();
  });

  test('should handle Bulygin_Nik username', async () => {
    const username = 'Bulygin_Nik';
    const telegramUserId = 999999999;
    
    await cacheUserIdByUsername(username, telegramUserId);
    const retrieved = await getUserIdByUsername(username);
    expect(retrieved).toBe(telegramUserId);
    
    await invalidateUsernameCache(username);
    expect(await getUserIdByUsername(username)).toBeNull();
  });

  test('should cache with correct TTL', async () => {
    const username = 'testuser';
    const telegramUserId = 123456789;
    
    await cacheUserIdByUsername(username, telegramUserId);
    
    // Check TTL is set (should be around 3600 seconds)
    const key = `tg:username:${username}:user_id`;
    const ttl = await redis.ttl(key);
    expect(ttl).toBeGreaterThan(3500);
    expect(ttl).toBeLessThanOrEqual(3600);
  });
});

