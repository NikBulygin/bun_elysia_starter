import { t } from 'elysia';
import { getByUsername } from '../../utils/user/getByUsername';
import { extractUserId } from '../../utils/telegram/extractUserId';

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Convert username to Telegram User ID',
  description: 'Retrieves Telegram User ID by username. Returns null if user not found.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  query: {
    login: {
      type: 'string',
      description: 'Telegram username (without @)',
      example: 'Bulygin_Nik',
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Telegram User ID or null',
      content: {
        'application/json': {
          schema: t.Union([
            t.Number({ example: 123456789 }),
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
            error: t.String({ example: 'Login parameter is required' }),
            status: t.Number({ example: 400 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ query }: { query?: { login?: string } }) {
  try {
    const login = query?.login;
    
    if (!login || login.trim() === '') {
      return {
        error: 'Login parameter is required',
        status: 400,
      };
    }

    // First try to get from database
    const user = await getByUsername(login);
    
    if (user && user.telegramUserId) {
      return user.telegramUserId;
    }

    // If not in database, try to extract from Telegram API
    const telegramUserId = await extractUserId(login);
    
    return telegramUserId;
  } catch (error) {
    console.error('Error in login2id:', error);
    return null;
  }
}

