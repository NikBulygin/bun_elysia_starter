import { db } from '../../db';
import { providers } from '../../db/schema';
import type { Provider, NewProvider } from '../../db/schema/providers';
import { validateProviderCredentials, type ProviderType, type ProviderName } from '../../providers/validators';

export interface CreateProviderData {
  type: ProviderType;
  name: ProviderName;
  credentials: Record<string, unknown>;
}

/**
 * Create new provider with credentials validation
 */
export async function createProvider(data: CreateProviderData): Promise<Provider> {
  // Validate credentials
  if (!validateProviderCredentials(data.type, data.name, data.credentials)) {
    throw new Error(`Invalid credentials for ${data.name} provider`);
  }

  const newProvider: NewProvider = {
    type: data.type,
    name: data.name,
    credentials: data.credentials,
  };

  const result = await db.insert(providers)
    .values(newProvider)
    .returning();

  return result[0];
}

