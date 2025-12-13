// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { getByTelegramUserId } from '../../../src/utils/user/getByTelegramUserId';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('User getByTelegramUserId', () => {
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

  test('should get user by telegramUserId', async () => {
    // Create user first
    const created = await getOrCreate('Bulygin_Nik');
    expect(created).not.toBeNull();
    expect(created?.telegramUserId).toBeGreaterThan(0);
    
    // Get by telegramUserId
    const user = await getByTelegramUserId(created!.telegramUserId);
    
    expect(user).not.toBeNull();
    expect(user?.telegramUserId).toBe(created?.telegramUserId);
    expect(user?.username).toBe('Bulygin_Nik');
  });

  test('should return null for non-existent telegramUserId', async () => {
    const user = await getByTelegramUserId(999999999);
    expect(user).toBeNull();
  });
});

