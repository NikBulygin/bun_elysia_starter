import { getAllProviders } from './getAll';
import { validateProvider } from './validate';
import type { Provider } from '../../db/schema/providers';

export interface ProviderWithStatus {
  id: number;
  type: string;
  name: string;
  isWork: boolean;
}

export interface ProvidersGroupedByType {
  time: ProviderWithStatus[];
  tasks: ProviderWithStatus[];
}

/**
 * Get all providers with status (without credentials)
 */
export async function getAllProvidersWithStatus(): Promise<ProviderWithStatus[]> {
  const providers = await getAllProviders();
  
  // Validate all providers in parallel
  const validationResults = await Promise.all(
    providers.map(provider => validateProvider(provider))
  );
  
  // Map to response format without credentials
  return providers.map((provider, index) => ({
    id: provider.id,
    type: provider.type,
    name: provider.name,
    isWork: validationResults[index].valid,
  }));
}

/**
 * Get all providers grouped by type
 */
export async function getAllProvidersGroupedByType(): Promise<ProvidersGroupedByType> {
  const providers = await getAllProvidersWithStatus();
  
  // Group by type
  const grouped: ProvidersGroupedByType = {
    time: [],
    tasks: [],
  };
  
  providers.forEach(provider => {
    if (provider.type === 'time') {
      grouped.time.push(provider);
    } else if (provider.type === 'tasks') {
      grouped.tasks.push(provider);
    }
  });
  
  return grouped;
}

