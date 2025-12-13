import { createHmac } from 'crypto';

const botToken = process.env.TELEGRAM_BOT_TOKEN || '';

export interface TelegramUserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Generate Telegram Mini App initData
 * 
 * Algorithm (reverse of validation):
 * 1. Create user object from user data
 * 2. Set auth_date = current Unix timestamp
 * 3. Form data_check_string:
 *    - Sort parameters (user, auth_date) alphabetically
 *    - Join as 'key=value' separated by '\n'
 * 4. Calculate secret_key = HMAC-SHA256("WebAppData", bot_token)
 * 5. Calculate hash = HMAC-SHA256(data_check_string, secret_key)
 * 6. Add hash to parameters
 * 7. Return query string: "user=...&auth_date=...&hash=..."
 * 
 * @param userData - User data from Telegram message
 * @returns Valid initData query string
 */
export function generateInitData(userData: TelegramUserData): string {
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  if (!userData || !userData.id) {
    throw new Error('Invalid user data: id is required');
  }

  // Create user object (only include fields that Telegram sends)
  const user: any = {
    id: userData.id,
  };

  if (userData.first_name) {
    user.first_name = userData.first_name;
  }
  if (userData.last_name) {
    user.last_name = userData.last_name;
  }
  if (userData.username) {
    user.username = userData.username;
  }
  if (userData.language_code) {
    user.language_code = userData.language_code;
  }
  if (userData.is_premium !== undefined) {
    user.is_premium = userData.is_premium;
  }
  if (userData.photo_url) {
    user.photo_url = userData.photo_url;
  }

  // Set auth_date to current Unix timestamp
  const authDate = Math.floor(Date.now() / 1000);

  // Create URLSearchParams for building query string
  const params = new URLSearchParams();
  
  // Add user parameter (URL encoded JSON)
  params.set('user', JSON.stringify(user));
  params.set('auth_date', authDate.toString());

  // Build data_check_string (without hash)
  const dataCheckPairs: string[] = [];
  const sortedKeys = Array.from(params.keys()).sort();

  for (const key of sortedKeys) {
    const value = params.get(key);
    if (value !== null) {
      dataCheckPairs.push(`${key}=${value}`);
    }
  }

  const dataCheckString = dataCheckPairs.join('\n');

  // Calculate secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Calculate hash = HMAC-SHA256(data_check_string, secret_key)
  const hash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Add hash to parameters
  params.set('hash', hash);

  // Return query string
  return params.toString();
}

