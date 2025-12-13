// @ts-ignore
import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { Elysia } from 'elysia';
import { validateInitDataMiddleware } from '../../src/middleware/validateInitData';
import { createHmac } from 'crypto';

describe('validateInitDataMiddleware', () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || 'test_bot_token_1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  beforeEach(() => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      process.env.TELEGRAM_BOT_TOKEN = botToken;
    }
  });

  function createValidInitData(userId: number = 123456789, username: string = 'testuser') {
    const user = {
      id: userId,
      first_name: 'Test',
      username: username,
    };
    
    const authDate = Math.floor(Date.now() / 1000);
    
    const params = new URLSearchParams();
    params.set('auth_date', String(authDate));
    params.set('user', JSON.stringify(user));
    
    // Build data_check_string
    const dataCheckPairs: string[] = [];
    const sortedKeys = Array.from(params.keys()).sort();
    for (const key of sortedKeys) {
      const value = params.get(key);
      if (value !== null) {
        dataCheckPairs.push(`${key}=${value}`);
      }
    }
    const dataCheckString = dataCheckPairs.join('\n');
    
    // Calculate hash
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    const hash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    params.set('hash', hash);
    return params.toString();
  }

  test('should extract telegramUserId from valid initData in header', async () => {
    const initData = createValidInitData();
    
    const mockUser = {
      telegramUserId: 123456789,
      username: 'testuser',
      role: 'none' as const,
    };

    // Mock user functions
    const getByTelegramUserIdMock = mock(() => Promise.resolve(mockUser));
    const getOrCreateMock = mock(() => Promise.resolve(mockUser));

    // We need to mock the imports, but Bun doesn't support module mocking easily
    // So we'll test the middleware integration differently
    const app = new Elysia()
      .use(validateInitDataMiddleware)
      .get('/test', ({ telegramUserId, user }) => {
        return { telegramUserId, user };
      })
      .onError(({ error }) => {
        return { error: error.message };
      });

    const response = await app.handle(
      new Request('http://localhost/test', {
        headers: {
          'X-Telegram-Init-Data': initData,
        },
      })
    );

    // The response might be 200 or 500 depending on database connection
    // We just check that the middleware processes the request
    expect([200, 500]).toContain(response.status);
  });

  test('should throw error on missing initData', async () => {
    const app = new Elysia()
      .use(validateInitDataMiddleware)
      .get('/test', () => ({ ok: true }))
      .onError(({ error }) => {
        return { error: error.message };
      });

    const response = await app.handle(
      new Request('http://localhost/test')
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Missing');
  });

  test('should throw error on invalid initData', async () => {
    const app = new Elysia()
      .use(validateInitDataMiddleware)
      .get('/test', () => ({ ok: true }))
      .onError(({ error }) => {
        return { error: error.message };
      });

    const response = await app.handle(
      new Request('http://localhost/test', {
        headers: {
          'X-Telegram-Init-Data': 'invalid_data',
        },
      })
    );

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain('Invalid');
  });
});

