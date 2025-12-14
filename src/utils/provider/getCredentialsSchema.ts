import type { ProviderType, ProviderName } from '../../db/schema/providers';

export interface CredentialsSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    description?: string;
  };
}

/**
 * Get credentials schema for a provider
 * Returns the structure of credentials required for a specific provider
 */
export function getCredentialsSchema(
  type: ProviderType,
  name: ProviderName
): CredentialsSchema | null {
  if (type === 'time' && name === 'Clockify') {
    return {
      token: {
        type: 'string',
        required: true,
        description: 'Clockify API token',
      },
    };
  }

  if (type === 'tasks' && name === 'Jira') {
    return {
      domain: {
        type: 'string',
        required: true,
        description: 'Jira domain name (e.g., "yourcompany.atlassian.net")',
      },
      email: {
        type: 'string',
        required: true,
        description: 'Jira account email',
      },
      token: {
        type: 'string',
        required: true,
        description: 'Jira API token',
      },
    };
  }

  return null;
}

