import { getUserByUsername } from './getUserByUsername';

/**
 * Validate that user exists in Telegram
 */
export async function validateUser(username: string): Promise<boolean> {
  if (!username || username.trim() === '') {
    return false;
  }
  
  try {
    const user = await getUserByUsername(username);
    return user !== null;
  } catch (error) {
    console.error(`Error validating user ${username}:`, error);
    return false;
  }
}

