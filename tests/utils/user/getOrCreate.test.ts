// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach, afterEach } from 'bun:test';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('User getOrCreate', () => {
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

  test('should create user for Bulygin_Nik if not exists', async () => {
    const user = await getOrCreate('Bulygin_Nik');
    
    expect(user).not.toBeNull();
    if (user) {
      expect(user.username).toBe('Bulygin_Nik');
      expect(user.telegramUserId).toBeGreaterThan(0);
      expect(user.role).toBe('none');
    }
  });

  test('should return existing user if already exists', async () => {
    const user1 = await getOrCreate('Bulygin_Nik');
    expect(user1).not.toBeNull();
    
    const user2 = await getOrCreate('Bulygin_Nik');
    expect(user2).not.toBeNull();
    expect(user2?.telegramUserId).toBe(user1?.telegramUserId);
    expect(user2?.username).toBe(user1?.username);
  });

  test('should return null for non-existent Telegram user', async () => {
    const randomUsername = `nonexistent_${Date.now()}`;
    const user = await getOrCreate(randomUsername);
    
    expect(user).toBeNull();
  });
});

