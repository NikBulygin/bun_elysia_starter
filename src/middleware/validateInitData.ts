import { Elysia } from 'elysia';
import { validateInitData } from '../utils/telegram/validateInitData';
import { getOrCreate } from '../utils/user/getOrCreate';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';

/**
 * Middleware to validate Telegram Mini App initData
 * Extracts initData from header X-Telegram-Init-Data or from body
 * Validates HMAC-SHA256 signature and extracts telegramUserId
 * Creates/gets user from database
 */
export const validateInitDataMiddleware = new Elysia()
  .derive(async ({ headers, body }: { headers: Record<string, string | undefined>; body?: any }) => {
    // Extract initData from header or body
    let initData: string | undefined;

    // Try header first (recommended)
    if (headers['x-telegram-init-data']) {
      initData = headers['x-telegram-init-data'];
    } else if (headers['X-Telegram-Init-Data']) {
      initData = headers['X-Telegram-Init-Data'];
    } else if (body && typeof body === 'object' && 'initData' in body) {
      initData = body.initData;
    }

    if (!initData) {
      throw new Error('Missing X-Telegram-Init-Data header or initData in body');
    }

    // Validate initData
    const validationResult = validateInitData(initData);
    
    if (!validationResult.isValid) {
      throw new Error('Invalid initData signature');
    }

    if (!validationResult.telegramUserId) {
      throw new Error('Could not extract telegramUserId from initData');
    }

    const telegramUserId = validationResult.telegramUserId;

    // Get or create user in database
    // First try to get by telegramUserId
    let user = await getByTelegramUserId(telegramUserId);
    
    // If user doesn't exist, try to get or create by username from initData
    if (!user) {
      // Extract username from initData user object
      const username = validationResult.user?.username;
      if (username) {
        user = await getOrCreate(username);
      } else {
        throw new Error('Could not create user: username not found in initData');
      }
    }

    return {
      telegramUserId,
      user,
      initData: validationResult,
    };
  });

