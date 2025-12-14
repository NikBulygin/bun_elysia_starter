import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { shouldApplyMiddleware } from '../utils/middleware/pathMatcher';

type UserRole = 'admin' | 'manager' | 'none';

/**
 * Middleware configuration with path patterns
 * Applies to all routes except public ones
 */
export const checkRoleMiddlewareConfig = {
  pathPatterns: ['/**'],
  excludePatterns: ['/health', '/api/health', '/', '/bot/**', '/api/bot/**'],
};

/**
 * Middleware to check user role
 * Requires telegramUserId in context (from validateUserByUsername)
 */
export function checkRole(allowedRoles: UserRole[]) {
  return new Elysia()
    .derive(async ({ request, telegramUserId }: { request?: Request; telegramUserId?: number }) => {
      const url = request ? new URL(request.url) : null;
      const path = url?.pathname || 'unknown';
      const method = request?.method || 'unknown';
      
      console.log(`🔐 [checkRole] ${method} ${path} - allowedRoles: [${allowedRoles.join(', ')}]`);
      
      // Double-check: if this is a public route, skip validation
      if (!shouldApplyMiddleware(path, checkRoleMiddlewareConfig)) {
        console.log(`   ⚠️  [checkRole] WARNING: Public route reached - should not happen`);
        console.log(`   ✅ [checkRole] Decision: SKIPPED - Public route, no auth required`);
        return {
          user: undefined,
        };
      }
      
      if (!telegramUserId) {
        console.log(`   ❌ [checkRole] Decision: REJECTED - User not authenticated`);
        throw new Error('User not authenticated');
      }

      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        console.log(`   ❌ [checkRole] Decision: REJECTED - User not found`);
        throw new Error('User not found');
      }

      if (!allowedRoles.includes(user.role)) {
        console.log(`   ❌ [checkRole] Decision: REJECTED - Access denied. User role: ${user.role}, Required: [${allowedRoles.join(', ')}]`);
        throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      console.log(`   ✅ [checkRole] Decision: ACCEPTED - User role: ${user.role}`);
      return {
        user,
      };
    });
}

