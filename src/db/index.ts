import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db';

const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });

export { schema };

