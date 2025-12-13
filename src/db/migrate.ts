import { db } from './index';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

/**
 * Initialize database: create extension and run migrations
 */
export async function initDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db';
    const migrationClient = postgres(databaseUrl, { max: 1 });
    const migrationDb = drizzle(migrationClient);
    
    // Create pgcrypto extension
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    console.log('✅ pgcrypto extension enabled');
    
    // Run migrations
    await migrate(migrationDb, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations applied');
    
    await migrationClient.end();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

