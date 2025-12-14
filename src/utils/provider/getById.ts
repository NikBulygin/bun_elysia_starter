import { db } from '../../db';
import { providers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Provider } from '../../db/schema/providers';

/**
 * Get provider by id
 */
export async function getProviderById(id: number): Promise<Provider | null> {
  const result = await db.select()
    .from(providers)
    .where(eq(providers.id, id))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

