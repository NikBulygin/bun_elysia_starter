import { db } from '../../db';
import { providers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import type { Provider } from '../../db/schema/providers';
import { validateProviderCredentials, type ProviderName } from '../../providers/validators';

export interface UpdateProviderData {
  credentials: Record<string, unknown>;
}

/**
 * Update provider credentials
 */
export async function updateProvider(id: number, data: UpdateProviderData): Promise<Provider | null> {
  // Get existing provider to validate credentials
  const existing = await db.select()
    .from(providers)
    .where(eq(providers.id, id))
    .limit(1);

  if (existing.length === 0) {
    return null;
  }

  const provider = existing[0];

  // Validate new credentials
  if (!validateProviderCredentials(provider.type, provider.name as ProviderName, data.credentials)) {
    throw new Error(`Invalid credentials for ${provider.name} provider`);
  }

  const result = await db.update(providers)
    .set({ credentials: data.credentials })
    .where(eq(providers.id, id))
    .returning();

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

