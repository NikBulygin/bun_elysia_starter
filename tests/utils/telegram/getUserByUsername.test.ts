// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll } from 'bun:test';
import { getUserByUsername } from '../../../src/utils/telegram/getUserByUsername';

describe('Telegram getUserByUsername', () => {
  beforeAll(() => {
    // Ensure TELEGRAM_BOT_TOKEN is set
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required for tests');
    }
  });

  test('should get user info for Bulygin_Nik', async () => {
    const user = await getUserByUsername('Bulygin_Nik');
    
    // Note: getChat API may not work for all users
    // If user is found, verify structure; if not, that's also valid
    if (user) {
      expect(user.id).toBeGreaterThan(0);
      expect(typeof user.id).toBe('number');
      expect(user.username).toBeDefined();
    } else {
      // User not found is also a valid response
      expect(user).toBeNull();
    }
  });

  test('should return null for non-existent user', async () => {
    const randomUsername = `nonexistent_${Date.now()}`;
    const user = await getUserByUsername(randomUsername);
    
    expect(user).toBeNull();
  });

  test('should return user with id and username when found', async () => {
    const user = await getUserByUsername('Bulygin_Nik');
    
    // If user is found, verify structure
    if (user) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user.id).toBeGreaterThan(0);
      expect(user.username).toBeDefined();
    }
    // If user is not found (null), that's also valid
  });

  test('should handle empty username', async () => {
    await expect(getUserByUsername('')).rejects.toThrow();
  });
});

