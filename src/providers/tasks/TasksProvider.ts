import { Provider } from '../base/Provider';

/**
 * Abstract class for Tasks providers (e.g., Jira)
 */
export abstract class TasksProvider extends Provider {
  /**
   * Get all projects
   */
  abstract getProjects(): Promise<unknown[]>;

  /**
   * Get sprints in a project
   */
  abstract getSprints(projectId: string): Promise<unknown[]>;

  /**
   * Get all task statuses in a project
   */
  abstract getStatuses(projectId: string): Promise<unknown[]>;

  /**
   * Get tasks in a project, optionally filtered by stage
   * Returns tasks with all deadlines, badges, and dates
   */
  abstract getTasks(projectId: string, stageId?: string): Promise<unknown[]>;

  /**
   * Get tasks assigned to a user
   */
  abstract getUserTasks(userId: string): Promise<unknown[]>;

  /**
   * Assign a task to a user (take task as executor)
   */
  abstract assignTask(taskId: string, userId: string): Promise<unknown>;

  /**
   * Complete a task (move to next stage)
   */
  abstract completeTask(taskId: string): Promise<unknown>;

  /**
   * Revert a task (move to previous stage)
   */
  abstract revertTask(taskId: string): Promise<unknown>;

  /**
   * Move a task to a specific stage
   */
  abstract moveTaskToStage(taskId: string, stageId: string): Promise<unknown>;

  /**
   * Get task description
   */
  abstract getTaskDescription(taskId: string): Promise<string>;

  /**
   * Get comments for a task
   */
  abstract getTaskComments(taskId: string): Promise<unknown[]>;

  /**
   * Add a comment to a task
   */
  abstract addTaskComment(taskId: string, comment: string): Promise<unknown>;
}

