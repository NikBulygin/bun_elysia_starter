import { Elysia } from 'elysia';
import { validateUser } from '../utils/telegram/validateUser';
import { extractUserId } from '../utils/telegram/extractUserId';

/**
 * Middleware to validate user by username and extract telegramUserId
 * Adds username and telegramUserId to context
 */
export const validateUserByUsername = new Elysia()
  .derive(async ({ params }) => {
    const username = (params as any).username;
    
    if (!username) {
      throw new Error('Username is required');
    }

    // Validate user exists in Telegram
    const isValid = await validateUser(username);
    if (!isValid) {
      throw new Error(`User ${username} not found in Telegram`);
    }

    // Extract telegramUserId
    const telegramUserId = await extractUserId(username);
    if (!telegramUserId) {
      throw new Error(`Could not extract user ID for ${username}`);
    }

    return {
      username,
      telegramUserId,
    };
  });

