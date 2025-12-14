import { TimeProvider } from './TimeProvider';

export interface ClockifyCredentials {
  token: string;
}

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

