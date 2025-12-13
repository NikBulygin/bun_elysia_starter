import { createHmac } from 'crypto';

const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Validate Telegram Mini App initData
 * 
 * Algorithm:
 * 1. Parse initData (query string format)
 * 2. Extract parameters (user, auth_date, hash, etc.)
 * 3. Form data_check_string:
 *    - Exclude 'hash' parameter
 *    - Sort remaining parameters alphabetically
 *    - Join as 'key=value' separated by '\n'
 * 4. Calculate secret_key = HMAC-SHA256("WebAppData", bot_token)
 * 5. Calculate HMAC-SHA256(data_check_string, secret_key)
 * 6. Compare with provided hash
 * 
 * @param initData - Query string format: "user=...&auth_date=...&hash=..."
 * @returns Object with isValid flag and parsed user data if valid
 */
export function validateInitData(initData: string): {
  isValid: boolean;
  telegramUserId?: number;
  user?: any;
  authDate?: number;
} {
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return { isValid: false };
  }

  if (!initData || typeof initData !== 'string') {
    return { isValid: false };
  }

  try {
    // Parse query string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    if (!hash) {
      return { isValid: false };
    }

    // Remove hash from params and sort alphabetically
    const dataCheckPairs: string[] = [];
    const sortedKeys = Array.from(params.keys())
      .filter(key => key !== 'hash')
      .sort();

    for (const key of sortedKeys) {
      const value = params.get(key);
      if (value !== null) {
        dataCheckPairs.push(`${key}=${value}`);
      }
    }

    // Join with '\n'
    const dataCheckString = dataCheckPairs.join('\n');

    // Calculate secret_key = HMAC-SHA256("WebAppData", bot_token)
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate HMAC-SHA256(data_check_string, secret_key)
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Compare hashes (case-insensitive)
    if (calculatedHash.toLowerCase() !== hash.toLowerCase()) {
      return { isValid: false };
    }

    // Extract user data
    const userParam = params.get('user');
    let user: any = null;
    let telegramUserId: number | undefined;

    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
        telegramUserId = user.id;
      } catch (e) {
        console.error('Failed to parse user data:', e);
        return { isValid: false };
      }
    }

    const authDate = params.get('auth_date');
    const authDateNum = authDate ? parseInt(authDate, 10) : undefined;

    // Optional: Check if auth_date is not too old (e.g., 24 hours)
    if (authDateNum) {
      const now = Math.floor(Date.now() / 1000);
      const maxAge = 24 * 60 * 60; // 24 hours
      if (now - authDateNum > maxAge) {
        return { isValid: false };
      }
    }

    return {
      isValid: true,
      telegramUserId,
      user,
      authDate: authDateNum,
    };
  } catch (error) {
    console.error('Error validating initData:', error);
    return { isValid: false };
  }
}

