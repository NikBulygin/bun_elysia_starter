import { t } from 'elysia';
import { getByTelegramUserId } from '../../utils/user/getByTelegramUserId';

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Convert Telegram User ID to username',
  description: 'Retrieves username by Telegram User ID. Returns null if user not found.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  query: {
    id: {
      type: 'number',
      description: 'Telegram User ID',
      example: 123456789,
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Username or null',
      content: {
        'application/json': {
          schema: t.Union([
            t.String({ example: 'Bulygin_Nik' }),
            t.Null(),
          ]),
        },
      },
    },
    400: {
      description: 'Invalid request',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Invalid ID parameter' }),
            status: t.Number({ example: 400 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ query }: { query?: { id?: string | number } }) {
  try {
    const idParam = query?.id;
    
    if (!idParam) {
      return {
        error: 'ID parameter is required',
        status: 400,
      };
    }

    const telegramUserId = typeof idParam === 'string' ? parseInt(idParam, 10) : idParam;
    
    if (isNaN(telegramUserId) || telegramUserId <= 0) {
      return {
        error: 'Invalid ID parameter',
        status: 400,
      };
    }

    const user = await getByTelegramUserId(telegramUserId);
    
    if (!user) {
      return null;
    }

    return user.username;
  } catch (error) {
    console.error('Error in id2login:', error);
    return null;
  }
}

