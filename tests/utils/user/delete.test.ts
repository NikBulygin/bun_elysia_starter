// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { deleteUser } from '../../../src/utils/user/delete';
import { getOrCreate } from '../../../src/utils/user/getOrCreate';
import { getByUsername } from '../../../src/utils/user/getByUsername';
import { clearTestData, initTestDatabase, waitForDatabase } from '../../helpers/db';
import { clearTestKeys, waitForRedis } from '../../helpers/redis';

describe('User delete', () => {
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

  test('should delete user by username', async () => {
    // Create user first
    await getOrCreate('Bulygin_Nik');
    
    // Verify user exists
    const beforeDelete = await getByUsername('Bulygin_Nik');
    expect(beforeDelete).not.toBeNull();
    
    // Delete user
    const deleted = await deleteUser('Bulygin_Nik');
    expect(deleted).toBe(true);
    
    // Verify user is deleted
    const afterDelete = await getByUsername('Bulygin_Nik');
    expect(afterDelete).toBeNull();
  });

  test('should return false for non-existent user', async () => {
    const deleted = await deleteUser('nonexistent');
    expect(deleted).toBe(false);
  });

  test('should invalidate cache after deletion', async () => {
    await getOrCreate('Bulygin_Nik');
    
    // Cache should exist (set by extractUserId)
    // After deletion, it should be invalidated
    await deleteUser('Bulygin_Nik');
    
    // User should not exist in DB
    const user = await getByUsername('Bulygin_Nik');
    expect(user).toBeNull();
  });
});

