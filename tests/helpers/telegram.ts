/**
 * Mock helpers for Telegram API
 */

export const mockTelegramUser = {
  id: 123456789,
  username: 'Bulygin_Nik',
  first_name: 'Nikita',
  last_name: 'Bulygin',
};

export const mockTelegramUserResponse = {
  ok: true,
  result: {
    id: mockTelegramUser.id,
    username: mockTelegramUser.username,
    first_name: mockTelegramUser.first_name,
    last_name: mockTelegramUser.last_name,
    type: 'private',
  },
};

export const mockTelegramErrorResponse = {
  ok: false,
  error_code: 400,
  description: 'Bad Request: chat not found',
};

/**
 * Mock fetch for Telegram API
 */
export function mockTelegramFetch(username: string, shouldExist: boolean = true) {
  if (username === 'Bulygin_Nik' && shouldExist) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => mockTelegramUserResponse,
    } as Response);
  }
  
  return Promise.resolve({
    ok: false,
    status: 400,
    json: async () => mockTelegramErrorResponse,
  } as Response);
}

