import { getProviderById } from './getById';
import { validateProvider } from './validate';

export interface ProviderWithStatus {
  id: number;
  type: string;
  name: string;
  isWork: boolean;
}

/**
 * Get provider by id with status (without credentials)
 */
export async function getProviderByIdWithStatus(id: number): Promise<ProviderWithStatus | null> {
  const provider = await getProviderById(id);
  
  if (!provider) {
    return null;
  }
  
  // Validate provider connection
  const validationResult = await validateProvider(provider);
  
  return {
    id: provider.id,
    type: provider.type,
    name: provider.name,
    isWork: validationResult.valid,
  };
}

