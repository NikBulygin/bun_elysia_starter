// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { get, set, del, delPattern } from '../../../src/utils/redis/cache';
import { redis } from '../../../src/utils/redis/client';

describe('Redis Cache Utils', () => {
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
    await redis.del('test:key1', 'test:key2', 'test:pattern:*');
  });

  test('should set and get value from cache', async () => {
    const key = 'test:key1';
    const value = 'test-value';
    
    const setResult = await set(key, value, 60);
    expect(setResult).toBe(true);
    
    const getResult = await get(key);
    expect(getResult).toBe(value);
  });

  test('should return null for non-existent key', async () => {
    const result = await get('test:non-existent');
    expect(result).toBeNull();
  });

  test('should delete value from cache', async () => {
    const key = 'test:key1';
    const value = 'test-value';
    
    await set(key, value, 60);
    const beforeDelete = await get(key);
    expect(beforeDelete).toBe(value);
    
    const deleteResult = await del(key);
    expect(deleteResult).toBe(true);
    
    const afterDelete = await get(key);
    expect(afterDelete).toBeNull();
  });

  test('should set value with custom TTL', async () => {
    const key = 'test:key1';
    const value = 'test-value';
    const ttl = 10;
    
    await set(key, value, ttl);
    const result = await get(key);
    expect(result).toBe(value);
    
    // Check TTL
    const remainingTtl = await redis.ttl(key);
    expect(remainingTtl).toBeGreaterThan(0);
    expect(remainingTtl).toBeLessThanOrEqual(ttl);
  });

  test('should delete multiple keys by pattern', async () => {
    // Set multiple keys with pattern
    await set('test:pattern:key1', 'value1', 60);
    await set('test:pattern:key2', 'value2', 60);
    await set('test:pattern:key3', 'value3', 60);
    
    // Verify they exist
    expect(await get('test:pattern:key1')).toBe('value1');
    expect(await get('test:pattern:key2')).toBe('value2');
    expect(await get('test:pattern:key3')).toBe('value3');
    
    // Delete by pattern
    const deleted = await delPattern('test:pattern:*');
    expect(deleted).toBe(3);
    
    // Verify they are deleted
    expect(await get('test:pattern:key1')).toBeNull();
    expect(await get('test:pattern:key2')).toBeNull();
    expect(await get('test:pattern:key3')).toBeNull();
  });

  test('should handle errors gracefully', async () => {
    // Test with invalid key (should not throw)
    const result = await get('');
    expect(result).toBeNull();
  });
});

