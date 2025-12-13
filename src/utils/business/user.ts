import { getOrCreate } from '../user/getOrCreate';
import { getByUsername } from '../user/getByUsername';
import { getByTelegramUserId } from '../user/getByTelegramUserId';
import { updateFields } from '../user/updateFields';
import { deleteUser } from '../user/delete';
import type { User } from '../../db/schema/users';

/**
 * Business logic for user operations
 * These functions use micro-functions and add business logic
 */

export async function getUserOrCreate(username: string): Promise<User | null> {
  return await getOrCreate(username);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return await getByUsername(username);
}

export async function getUserByTelegramUserId(telegramUserId: number): Promise<User | null> {
  return await getByTelegramUserId(telegramUserId);
}

export async function updateUserFields(username: string, fields: { role?: 'admin' | 'manager' | 'none' }): Promise<User | null> {
  return await updateFields(username, fields);
}

export async function deleteUserByUsername(username: string): Promise<boolean> {
  return await deleteUser(username);
}

