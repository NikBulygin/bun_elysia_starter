import { db } from '../../src/db';
import { sql } from 'drizzle-orm';
import { users, projects, stages, projectManagers, stageUsers } from '../../src/db/schema';

/**
 * Database test helpers
 */

/**
 * Clear all test data from database
 */
export async function clearTestData(): Promise<void> {
  await db.execute(sql`TRUNCATE TABLE stage_users RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE project_managers RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE stages RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE projects RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(maxRetries: number = 10): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.execute(sql`SELECT 1`);
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

/**
 * Initialize database (run migrations)
 */
export async function initTestDatabase(): Promise<void> {
  const { initDatabase } = await import('../../src/db/migrate');
  await initDatabase();
}

