import { TimeProvider } from './TimeProvider';
import type { Workspace } from './types';

export interface ClockifyCredentials {
  token: string;
}

const CLOCKIFY_API_BASE = 'https://api.clockify.me/api/v1';

/**
 * Clockify provider implementation
 */
export class ClockifyProvider extends TimeProvider {
  private token: string;

  constructor(credentials: Record<string, unknown>) {
    super(credentials);
    if (!credentials.token || typeof credentials.token !== 'string') {
      throw new Error('Invalid Clockify credentials: token is required');
    }
    this.token = credentials.token;
  }

  async getWorkspaces(filters?: { roles?: string[] }): Promise<Workspace[]> {
    const url = new URL(`${CLOCKIFY_API_BASE}/workspaces`);
    
    // Add roles query parameters if provided
    if (filters?.roles && filters.roles.length > 0) {
      filters.roles.forEach(role => {
        url.searchParams.append('roles', role);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Api-Key': this.token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Clockify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const workspaces: Workspace[] = await response.json();
    return workspaces;
  }

  async validateConnection(): Promise<boolean> {
    // TODO: Implement actual Clockify API validation
    // Example: GET https://api.clockify.me/api/v1/user
    return true;
  }

  async getStatistics(
    period: { start: Date; end: Date },
    projectId?: string
  ): Promise<unknown> {
    // TODO: Implement Clockify API call to get statistics
    // Example: GET https://api.clockify.me/api/v1/workspaces/{workspaceId}/reports/summary
    throw new Error('Not implemented');
  }

  async getProjects(): Promise<unknown[]> {
    // TODO: Implement Clockify API call to get projects
    // Example: GET https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects
    throw new Error('Not implemented');
  }

  async createProject(name: string): Promise<unknown> {
    // TODO: Implement Clockify API call to create project
    // Example: POST https://api.clockify.me/api/v1/workspaces/{workspaceId}/projects
    throw new Error('Not implemented');
  }

  async getTasks(
    period?: { start: Date; end: Date },
    projectId?: string
  ): Promise<unknown[]> {
    // TODO: Implement Clockify API call to get time entries (tasks)
    // Example: GET https://api.clockify.me/api/v1/workspaces/{workspaceId}/timeEntries
    throw new Error('Not implemented');
  }

  async createTask(projectId: string, taskName: string): Promise<unknown> {
    // TODO: Implement Clockify API call to create time entry
    // Example: POST https://api.clockify.me/api/v1/workspaces/{workspaceId}/timeEntries
    throw new Error('Not implemented');
  }

  async startTask(taskId: string): Promise<unknown> {
    // TODO: Implement Clockify API call to start timer
    // Example: POST https://api.clockify.me/api/v1/workspaces/{workspaceId}/timeEntries
    throw new Error('Not implemented');
  }

  async stopTask(taskId: string): Promise<unknown> {
    // TODO: Implement Clockify API call to stop timer
    // Example: PATCH https://api.clockify.me/api/v1/workspaces/{workspaceId}/timeEntries/{timeEntryId}
    throw new Error('Not implemented');
  }
}

