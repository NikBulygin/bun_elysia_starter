import type { ClockifyCredentials } from '../time/ClockifyProvider';

/**
 * Validate Clockify credentials
 * Clockify requires only a token
 */
export function validateClockifyCredentials(
  credentials: unknown
): credentials is ClockifyCredentials {
  if (!credentials || typeof credentials !== 'object') {
    return false;
  }

  const creds = credentials as Record<string, unknown>;

  // Check if token exists and is a string
  if (!creds.token || typeof creds.token !== 'string' || creds.token.trim() === '') {
    return false;
  }

  return true;
}

