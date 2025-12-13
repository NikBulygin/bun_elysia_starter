// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import * as businessUser from '../../../src/utils/business/user';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('Business User Utils', () => {
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

  test('should get or create user', async () => {
    const user = await businessUser.getUserOrCreate('Bulygin_Nik');
    expect(user).not.toBeNull();
    expect(user?.username).toBe('Bulygin_Nik');
  });

  test('should get user by username', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    const user = await businessUser.getUserByUsername('Bulygin_Nik');
    expect(user).not.toBeNull();
    expect(user?.username).toBe('Bulygin_Nik');
  });

  test('should update user fields', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    const updated = await businessUser.updateUserFields('Bulygin_Nik', { role: 'admin' });
    expect(updated).not.toBeNull();
    expect(updated?.role).toBe('admin');
  });

  test('should delete user', async () => {
    await businessUser.getUserOrCreate('Bulygin_Nik');
    const deleted = await businessUser.deleteUserByUsername('Bulygin_Nik');
    expect(deleted).toBe(true);
    
    const user = await businessUser.getUserByUsername('Bulygin_Nik');
    expect(user).toBeNull();
  });
});

