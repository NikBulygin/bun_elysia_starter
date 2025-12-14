import { Elysia } from 'elysia';
import { validateUser } from '../utils/telegram/validateUser';
import { extractUserId } from '../utils/telegram/extractUserId';

/**
 * Middleware to validate user by username and extract telegramUserId
 * Adds username and telegramUserId to context
 */
export const validateUserByUsername = new Elysia()
  .derive(async (context) => {
    // Safely get params from context
    const params = (context as any)?.params;
    
    // If params doesn't exist or doesn't have username, skip this middleware
    // This middleware should only be used on routes with [username] parameter
    if (!params || typeof params !== 'object' || !params.username) {
      // Return empty values - this route doesn't need username validation
      return {
        username: undefined,
        telegramUserId: undefined,
      };
    }
    
    const username = params.username;

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

