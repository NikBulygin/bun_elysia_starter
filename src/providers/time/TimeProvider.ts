import { Provider } from '../base/Provider';
import type { Workspace } from './types';

/**
 * Abstract class for Time providers (e.g., Clockify)
 */
export abstract class TimeProvider extends Provider {
  /**
   * Get all workspaces, optionally filtered by roles
   */
  abstract getWorkspaces(filters?: { roles?: string[] }): Promise<Workspace[]>;

  /**
   * Get statistics for a period, optionally filtered by project
   */
  abstract getStatistics(period: { start: Date; end: Date }, projectId?: string): Promise<unknown>;

  /**
   * Get all projects
   */
  abstract getProjects(): Promise<unknown[]>;

  /**
   * Create a new project
   */
  abstract createProject(name: string): Promise<unknown>;

  /**
   * Get all tasks, optionally filtered by period and project
   */
  abstract getTasks(period?: { start: Date; end: Date }, projectId?: string): Promise<unknown[]>;

  /**
   * Create a new task in a project
   */
  abstract createTask(projectId: string, taskName: string): Promise<unknown>;

  /**
   * Start a task
   */
  abstract startTask(taskId: string): Promise<unknown>;

  /**
   * Stop a task
   */
  abstract stopTask(taskId: string): Promise<unknown>;
}

