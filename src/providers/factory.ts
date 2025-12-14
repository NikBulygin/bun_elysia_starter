import { Provider } from './base/Provider';
import { TimeProvider } from './time/TimeProvider';
import { TasksProvider } from './tasks/TasksProvider';
import { ClockifyProvider, type ClockifyCredentials } from './time/ClockifyProvider';
import { JiraProvider, type JiraCredentials } from './tasks/JiraProvider';
import { validateProviderCredentials, type ProviderType, type ProviderName } from './validators';

/**
 * Create a provider instance based on type and name
 */
export function createProvider(
  type: ProviderType,
  name: ProviderName,
  credentials: unknown
): Provider {
  // Validate credentials first
  if (!validateProviderCredentials(type, name, credentials)) {
    throw new Error(`Invalid credentials for ${name} provider`);
  }

  if (type === 'time' && name === 'Clockify') {
    return new ClockifyProvider(credentials as ClockifyCredentials);
  }

  if (type === 'tasks' && name === 'Jira') {
    return new JiraProvider(credentials as JiraCredentials);
  }

  throw new Error(`Unknown provider: ${type}/${name}`);
}

/**
 * Create a TimeProvider instance
 */
export function createTimeProvider(
  name: ProviderName,
  credentials: unknown
): TimeProvider {
  const provider = createProvider('time', name, credentials);
  if (!(provider instanceof TimeProvider)) {
    throw new Error(`Provider ${name} is not a TimeProvider`);
  }
  return provider;
}

/**
 * Create a TasksProvider instance
 */
export function createTasksProvider(
  name: ProviderName,
  credentials: unknown
): TasksProvider {
  const provider = createProvider('tasks', name, credentials);
  if (!(provider instanceof TasksProvider)) {
    throw new Error(`Provider ${name} is not a TasksProvider`);
  }
  return provider;
}

