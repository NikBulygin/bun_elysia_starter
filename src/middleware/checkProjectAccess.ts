import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { getManagersByProject } from '../utils/manager/getByProject';
import { getProjectById } from '../utils/project/getById';

/**
 * Middleware to check access to project
 * Admin has access to all projects, manager only to assigned projects
 * Requires telegramUserId in context
 */
export function checkProjectAccess() {
  return new Elysia()
    .derive(async ({ params, telegramUserId }: { params: any; telegramUserId?: number }) => {
      if (!telegramUserId) {
        throw new Error('User not authenticated');
      }

      const projectId = parseInt((params as any).id || (params as any).projectId);
      if (!projectId || isNaN(projectId)) {
        throw new Error('Invalid project ID');
      }

      // Check if project exists
      const project = await getProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Get user
      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        throw new Error('User not found');
      }

      // Admin has access to all projects
      if (user.role === 'admin') {
        return {
          project,
          user,
        };
      }

      // Manager needs to be assigned to project
      if (user.role === 'manager') {
        const managers = await getManagersByProject(projectId);
        const isManager = managers.some(m => m.telegramUserId === telegramUserId);
        
        if (!isManager) {
          throw new Error('Access denied. You are not a manager of this project');
        }
      } else {
        throw new Error('Access denied. Admin or manager role required');
      }

      return {
        project,
        user,
      };
    });
}

