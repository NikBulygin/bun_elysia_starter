import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { getStageById } from '../utils/stage/getById';
import { getManagersByProject } from '../utils/manager/getByProject';

/**
 * Middleware to check access to stage
 * Admin has access to all stages, manager only to stages in assigned projects
 * Requires telegramUserId in context
 */
export function checkStageAccess() {
  return new Elysia()
    .derive(async ({ params, telegramUserId }: { params: any; telegramUserId?: number }) => {
      if (!telegramUserId) {
        throw new Error('User not authenticated');
      }

      const stageId = parseInt((params as any).stageId);
      if (!stageId || isNaN(stageId)) {
        throw new Error('Invalid stage ID');
      }

      // Check if stage exists
      const stage = await getStageById(stageId);
      if (!stage) {
        throw new Error('Stage not found');
      }

      // Get user
      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        throw new Error('User not found');
      }

      // Admin has access to all stages
      if (user.role === 'admin') {
        return {
          stage,
          user,
        };
      }

      // Manager needs to be assigned to project
      if (user.role === 'manager') {
        const managers = await getManagersByProject(stage.projectId);
        const isManager = managers.some(m => m.telegramUserId === telegramUserId);
        
        if (!isManager) {
          throw new Error('Access denied. You are not a manager of this project');
        }
      } else {
        throw new Error('Access denied. Admin or manager role required');
      }

      return {
        stage,
        user,
      };
    });
}

