import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { validateUser } from '../telegram/validateUser';
import { extractUserId } from '../telegram/extractUserId';
import type { User, NewUser } from '../../db/schema/users';

/**
 * Get or create user by username
 * Validates user exists in Telegram, extracts telegramUserId, creates if not exists in DB
 */
export async function getOrCreate(username: string): Promise<User | null> {
  console.log(`   🔍 [getOrCreate] Starting for username: ${username}`);
  
  // Validate user exists in Telegram
  console.log(`   🔍 [getOrCreate] Validating user in Telegram...`);
  const isValid = await validateUser(username);
  console.log(`   🔍 [getOrCreate] Validation result: ${isValid}`);
  if (!isValid) {
    console.log(`   ❌ [getOrCreate] User validation failed - user not found in Telegram`);
    return null;
  }

  // Extract telegramUserId
  console.log(`   🔍 [getOrCreate] Extracting telegramUserId...`);
  const telegramUserId = await extractUserId(username);
  console.log(`   🔍 [getOrCreate] Extracted telegramUserId: ${telegramUserId || 'null'}`);
  if (!telegramUserId) {
    console.log(`   ❌ [getOrCreate] Failed to extract telegramUserId`);
    return null;
  }

  // Check if user exists in DB
  console.log(`   🔍 [getOrCreate] Checking if user exists in DB...`);
  const existing = await db.select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    console.log(`   ✅ [getOrCreate] Found existing user in DB: ${username} (role: ${existing[0].role})`);
    return existing[0];
  }

  // Create new user with role='none'
  console.log(`   🔍 [getOrCreate] Creating new user in DB...`);
  const newUser: NewUser = {
    telegramUserId,
    username,
    role: 'none',
  };

  try {
    const result = await db.insert(users)
      .values(newUser)
      .returning();

    console.log(`   ✅ [getOrCreate] Created new user: ${username} (telegramUserId: ${telegramUserId}, role: ${result[0].role})`);
    return result[0];
  } catch (err: any) {
    const errorMessage = err?.message || err?.code || String(err);
    console.log(`   ❌ [getOrCreate] Error creating user in DB: ${errorMessage}`);
    throw err;
  }
}

