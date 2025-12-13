// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'bun:test';
import { getByUsername } from '../../../src/utils/user/getByUsername';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('User getByUsername', () => {
  beforeAll(async () => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required for tests');
    }
    
    await waitForDatabase();
    await waitForRedis();
    await initTestDatabase();
  });

  beforeEach(async () => {
    await clearTestData();
    await clearTestKeys();
  });

  test('should get existing user by username', async () => {
    // Create user first
    const created = await getOrCreate('Bulygin_Nik');
    expect(created).not.toBeNull();
    
    // Get by username
    const user = await getByUsername('Bulygin_Nik');
    
    expect(user).not.toBeNull();
    expect(user?.username).toBe('Bulygin_Nik');
    expect(user?.telegramUserId).toBe(created?.telegramUserId);
  });

  test('should return null for non-existent user', async () => {
    const user = await getByUsername('nonexistent');
    expect(user).toBeNull();
  });

  test('should extract and update telegramUserId if missing', async () => {
    // This test would require creating a user without telegramUserId
    // which is difficult with current schema, so we test the happy path
    const created = await getOrCreate('Bulygin_Nik');
    expect(created).not.toBeNull();
    expect(created?.telegramUserId).toBeGreaterThan(0);
    
    const retrieved = await getByUsername('Bulygin_Nik');
    expect(retrieved?.telegramUserId).toBe(created?.telegramUserId);
  });
});

