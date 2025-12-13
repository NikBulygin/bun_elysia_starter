import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db';

// Suppress NOTICE messages in test environment
if (process.env.NODE_ENV === 'test') {
  // Add client_min_messages parameter to suppress NOTICE
  const url = new URL(databaseUrl);
  url.searchParams.set('options', '-c client_min_messages=warning');
  databaseUrl = url.toString();
}

const client = postgres(databaseUrl, {
  // Suppress NOTICE messages (like "truncate cascades to table")
  onnotice: process.env.NODE_ENV === 'test' ? () => {} : undefined,
});

export const db = drizzle(client, { schema });

export { schema };

