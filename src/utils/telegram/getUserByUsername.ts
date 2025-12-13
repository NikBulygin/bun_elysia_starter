const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Get user information from Telegram Bot API by username
 */
export async function getUserByUsername(username: string): Promise<TelegramUser | null> {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set');
  }

  if (!username || username.trim() === '') {
    throw new Error('Username cannot be empty');
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChat?chat_id=@${username}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 400) {
        // User not found
        return null;
      }
      throw new Error(`Telegram API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.ok) {
      return null;
    }

    const chat = data.result;
    
    // Check if it's a user (not a group/channel)
    if (chat.type !== 'private') {
      return null;
    }

    return {
      id: chat.id,
      username: chat.username,
      first_name: chat.first_name,
      last_name: chat.last_name,
    };
  } catch (error) {
    console.error(`Error fetching user ${username} from Telegram:`, error);
    throw error;
  }
}

