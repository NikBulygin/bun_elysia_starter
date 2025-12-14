import type { JiraCredentials } from '../tasks/JiraProvider';

/**
 * Validate Jira credentials
 * Jira requires: domain name, email, and token
 */
export function validateJiraCredentials(
  credentials: unknown
): credentials is JiraCredentials {
  if (!credentials || typeof credentials !== 'object') {
    return false;
  }

  const creds = credentials as Record<string, unknown>;

  // Check if domain exists and is a string
  if (!creds.domain || typeof creds.domain !== 'string' || creds.domain.trim() === '') {
    return false;
  }

  // Check if email exists and is a string
  if (!creds.email || typeof creds.email !== 'string' || creds.email.trim() === '') {
    return false;
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(creds.email)) {
    return false;
  }

  // Check if token exists and is a string
  if (!creds.token || typeof creds.token !== 'string' || creds.token.trim() === '') {
    return false;
  }

  return true;
}

