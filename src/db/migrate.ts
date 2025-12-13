import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Initialize database: create extension
 * Schema is pushed via drizzle-kit push:pg command before app starts
 */
export async function initDatabase() {
  try {
    // Create pgcrypto extension (if not exists)
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    console.log('✅ pgcrypto extension enabled');
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

