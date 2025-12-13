import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';

type UserRole = 'admin' | 'manager' | 'none';

/**
 * Middleware to check user role
 * Requires telegramUserId in context (from validateUserByUsername)
 */
export function checkRole(allowedRoles: UserRole[]) {
  return new Elysia()
    .derive(async ({ telegramUserId }: { telegramUserId?: number }) => {
      if (!telegramUserId) {
        throw new Error('User not authenticated');
      }

      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!allowedRoles.includes(user.role)) {
        throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
      }

      return {
        user,
      };
    });
}

