import { validateClockifyCredentials } from './clockify';
import { validateJiraCredentials } from './jira';

export type ProviderType = 'time' | 'tasks';
export type ProviderName = 'Clockify' | 'Jira';

/**
 * Validate provider credentials based on type and name
 */
export function validateProviderCredentials(
  type: ProviderType,
  name: ProviderName,
  credentials: unknown
): boolean {
  if (type === 'time' && name === 'Clockify') {
    return validateClockifyCredentials(credentials);
  }

  if (type === 'tasks' && name === 'Jira') {
    return validateJiraCredentials(credentials);
  }

  return false;
}

