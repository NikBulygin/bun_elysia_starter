import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { getStageById } from '../utils/stage/getById';
import { getManagersByProject } from '../utils/manager/getByProject';
import { shouldApplyMiddleware } from '../utils/middleware/pathMatcher';

/**
 * Middleware configuration with path patterns
 * Applies only to stage routes within projects
 */
export const checkStageAccessMiddlewareConfig = {
  pathPatterns: ['/project/**/stage/**'],
};

/**
 * Middleware to check access to stage
 * Admin has access to all stages, manager only to stages in assigned projects
 * Requires telegramUserId in context
 */
export function checkStageAccess() {
  return new Elysia()
    .derive(async ({ request, params, telegramUserId }: { request?: Request; params: any; telegramUserId?: number }) => {
      const url = request ? new URL(request.url) : null;
      const path = url?.pathname || 'unknown';
      const method = request?.method || 'unknown';
      
      console.log(`🔐 [checkStageAccess] ${method} ${path}`);
      
      // Double-check: if this is not a stage route, skip validation
      if (!shouldApplyMiddleware(path, checkStageAccessMiddlewareConfig)) {
        console.log(`   ⚠️  [checkStageAccess] WARNING: Non-stage route reached - should not happen`);
        console.log(`   ✅ [checkStageAccess] Decision: SKIPPED - Not a stage route`);
        return {
          stage: undefined,
          user: undefined,
        };
      }
      
      if (!telegramUserId) {
        console.log(`   ❌ [checkStageAccess] Decision: REJECTED - User not authenticated`);
        throw new Error('User not authenticated');
      }

      const stageId = parseInt((params as any).stageId);
      if (!stageId || isNaN(stageId)) {
        console.log(`   ❌ [checkStageAccess] Decision: REJECTED - Invalid stage ID`);
        throw new Error('Invalid stage ID');
      }

      // Check if stage exists
      const stage = await getStageById(stageId);
      if (!stage) {
        console.log(`   ❌ [checkStageAccess] Decision: REJECTED - Stage not found`);
        throw new Error('Stage not found');
      }

      // Get user
      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        console.log(`   ❌ [checkStageAccess] Decision: REJECTED - User not found`);
        throw new Error('User not found');
      }

      // Admin has access to all stages
      if (user.role === 'admin') {
        console.log(`   ✅ [checkStageAccess] Decision: ACCEPTED - Admin access to stage ${stageId}`);
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
          console.log(`   ❌ [checkStageAccess] Decision: REJECTED - Not a manager of project ${stage.projectId}`);
          throw new Error('Access denied. You are not a manager of this project');
        }
        console.log(`   ✅ [checkStageAccess] Decision: ACCEPTED - Manager access to stage ${stageId}`);
      } else {
        console.log(`   ❌ [checkStageAccess] Decision: REJECTED - Access denied. Admin or manager role required`);
        throw new Error('Access denied. Admin or manager role required');
      }

      return {
        stage,
        user,
      };
    });
}

