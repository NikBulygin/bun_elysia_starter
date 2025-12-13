import { t } from 'elysia';
import { validateUserByUsername } from '../../middleware/validateUserByUsername';
import { getUserOrCreate } from '../../utils/business/user';

export const middleware = [validateUserByUsername];

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Get user by username (creates if not exists)',
  description: 'Retrieves user information by Telegram username. If user does not exist in database, creates it automatically with role "none".',
  params: {
    username: {
      type: 'string',
      description: 'Telegram username (without @)',
      example: 'Bulygin_Nik',
    },
  },
  responses: {
    200: {
      description: 'User information',
      content: {
        'application/json': {
          schema: t.Object({
            telegramUserId: t.Number({ example: 123456789 }),
            username: t.String({ example: 'Bulygin_Nik' }),
            role: t.Union([t.Literal('admin'), t.Literal('manager'), t.Literal('none')], { example: 'none' }),
          }),
        },
      },
    },
    404: {
      description: 'User not found in Telegram',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'User not found' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ username, telegramUserId }: { username: string; telegramUserId: number }) {
  const user = await getUserOrCreate(username);
  
  if (!user) {
    return {
      error: 'User not found',
      status: 404,
    };
  }

  return {
    telegramUserId: user.telegramUserId,
    username: user.username,
    role: user.role,
  };
}

