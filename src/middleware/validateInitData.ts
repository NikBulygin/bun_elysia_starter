import { Elysia } from 'elysia';
import { validateInitData } from '../utils/telegram/validateInitData';
import { getOrCreate } from '../utils/user/getOrCreate';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { shouldApplyMiddleware } from '../utils/middleware/pathMatcher';

/**
 * Middleware configuration with path patterns
 * Applies to all routes except public ones
 */
export const validateInitDataMiddlewareConfig = {
  pathPatterns: ['/**'],
  excludePatterns: ['/health', '/api/health', '/', '/bot/**', '/api/bot/**'],
};

/**
 * Middleware to validate Telegram Mini App initData
 * Extracts initData from header X-Telegram-Init-Data or from body
 * Validates HMAC-SHA256 signature and extracts telegramUserId
 * Creates/gets user from database
 */
export const validateInitDataMiddleware = new Elysia()
  .derive(async ({ request, headers, body }: { request: Request; headers: Record<string, string | undefined>; body?: any }) => {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    
    console.log(`🔐 [validateInitDataMiddleware] ${method} ${path}`);
    
    // Double-check: if this is a public route, skip validation
    // This is a safety check - middleware should not be applied to public routes at all
    if (!shouldApplyMiddleware(path, validateInitDataMiddlewareConfig)) {
      console.log(`   ⚠️  [validateInitDataMiddleware] WARNING: Public route reached - should not happen`);
      console.log(`   ✅ [validateInitDataMiddleware] Decision: SKIPPED - Public route, no auth required`);
      // Return early without throwing error - this allows the route to proceed
      return {
        telegramUserId: undefined,
        user: undefined,
        initData: undefined,
      };
    }
    
    // Extract initData from header or body
    let initData: string | undefined;

    // Try header first (recommended)
    if (headers['x-telegram-init-data']) {
      initData = headers['x-telegram-init-data'];
      console.log(`   📥 [validateInitDataMiddleware] InitData source: header (x-telegram-init-data)`);
    } else if (headers['X-Telegram-Init-Data']) {
      initData = headers['X-Telegram-Init-Data'];
      console.log(`   📥 [validateInitDataMiddleware] InitData source: header (X-Telegram-Init-Data)`);
    } else if (body && typeof body === 'object' && 'initData' in body) {
      initData = body.initData;
      console.log(`   📥 [validateInitDataMiddleware] InitData source: body`);
    }

    if (!initData) {
      console.log(`   ❌ [validateInitDataMiddleware] Decision: REJECTED - Missing X-Telegram-Init-Data header or initData in body`);
      throw new Error('Missing X-Telegram-Init-Data header or initData in body');
    }

    // Validate initData
    const validationResult = validateInitData(initData);
    
    if (!validationResult.isValid) {
      console.log(`   ❌ [validateInitDataMiddleware] Decision: REJECTED - Invalid initData signature`);
      throw new Error('Invalid initData signature');
    }

    if (!validationResult.telegramUserId) {
      console.log(`   ❌ [validateInitDataMiddleware] Decision: REJECTED - Could not extract telegramUserId from initData`);
      throw new Error('Could not extract telegramUserId from initData');
    }

    const telegramUserId = validationResult.telegramUserId;
    console.log(`   ✅ [validateInitDataMiddleware] Decision: ACCEPTED - telegramUserId: ${telegramUserId}`);

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

