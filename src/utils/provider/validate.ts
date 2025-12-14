import { getProviderById } from './getById';
import { getAllProviders } from './getAll';
import { createProvider, type ProviderType, type ProviderName } from '../../providers/factory';
import type { Provider } from '../../db/schema/providers';

export interface ValidationResult {
  id: number;
  name: string;
  type: string;
  valid: boolean;
  error?: string;
}

/**
 * Validate a single provider
 */
export async function validateProvider(provider: Provider): Promise<ValidationResult> {
  try {
    const providerInstance = createProvider(
      provider.type as ProviderType,
      provider.name as ProviderName,
      provider.credentials
    );

    const isValid = await providerInstance.validateConnection();

    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      valid: isValid,
    };
  } catch (error: any) {
    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      valid: false,
      error: error.message || 'Validation failed',
    };
  }
}

/**
 * Validate provider by id
 */
export async function validateProviderById(id: number): Promise<ValidationResult | null> {
  const provider = await getProviderById(id);
  if (!provider) {
    return null;
  }

  return await validateProvider(provider);
}

/**
 * Validate all providers
 */
export async function validateAllProviders(): Promise<ValidationResult[]> {
  const providers = await getAllProviders();
  const results = await Promise.all(providers.map(validateProvider));
  return results;
}

