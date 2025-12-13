import { NewUser } from '../../src/db/schema/users';

/**
 * Test user fixtures
 */

export const adminUser: NewUser = {
  telegramUserId: 123456789, // Mock ID for Bulygin_Nik
  username: 'Bulygin_Nik',
  role: 'admin',
};

export const managerUser: NewUser = {
  telegramUserId: 987654321,
  username: 'test_manager',
  role: 'manager',
};

export const regularUser: NewUser = {
  telegramUserId: 555555555,
  username: 'test_user',
  role: 'none',
};

export const testUsers: NewUser[] = [adminUser, managerUser, regularUser];

