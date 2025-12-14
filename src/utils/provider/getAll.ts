import { db } from '../../db';
import { providers } from '../../db/schema';
import type { Provider } from '../../db/schema/providers';

/**
 * Get all providers
 */
export async function getAllProviders(): Promise<Provider[]> {
  return await db.select().from(providers);
}

