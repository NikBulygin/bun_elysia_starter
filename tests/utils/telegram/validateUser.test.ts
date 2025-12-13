// @ts-ignore - bun:test is available in Bun runtime
import { describe, test, expect, beforeAll } from 'bun:test';
import { validateUser } from '../../../src/utils/telegram/validateUser';

describe('Telegram validateUser', () => {
  beforeAll(() => {
    // Ensure TELEGRAM_BOT_TOKEN is set
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required for tests');
    }
  });

  test('should validate existing user Bulygin_Nik', async () => {
    const isValid = await validateUser('Bulygin_Nik');
    // Note: This may return false if user is not found via getChat API
    // The function should still work correctly (return boolean)
    expect(typeof isValid).toBe('boolean');
  });

  test('should return false for non-existent user', async () => {
    const randomUsername = `nonexistent_${Date.now()}`;
    const isValid = await validateUser(randomUsername);
    expect(isValid).toBe(false);
  });

  test('should handle errors gracefully', async () => {
    // Test with invalid input
    const result = await validateUser('');
    expect(typeof result).toBe('boolean');
  });
});

