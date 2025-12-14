import { Elysia } from 'elysia';
import { getByTelegramUserId } from '../utils/user/getByTelegramUserId';
import { getManagersByProject } from '../utils/manager/getByProject';
import { getProjectById } from '../utils/project/getById';
import { shouldApplyMiddleware } from '../utils/middleware/pathMatcher';

/**
 * Middleware configuration with path patterns
 * Applies only to project routes
 */
export const checkProjectAccessMiddlewareConfig = {
  pathPatterns: ['/project/**'],
};

/**
 * Middleware to check access to project
 * Admin has access to all projects, manager only to assigned projects
 * Requires telegramUserId in context
 */
export function checkProjectAccess() {
  return new Elysia()
    .derive(async ({ request, params, telegramUserId }: { request?: Request; params: any; telegramUserId?: number }) => {
      const url = request ? new URL(request.url) : null;
      const path = url?.pathname || 'unknown';
      const method = request?.method || 'unknown';
      
      console.log(`🔐 [checkProjectAccess] ${method} ${path}`);
      
      // Double-check: if this is not a project route, skip validation
      if (!shouldApplyMiddleware(path, checkProjectAccessMiddlewareConfig)) {
        console.log(`   ⚠️  [checkProjectAccess] WARNING: Non-project route reached - should not happen`);
        console.log(`   ✅ [checkProjectAccess] Decision: SKIPPED - Not a project route`);
        return {
          project: undefined,
          user: undefined,
        };
      }
      
      if (!telegramUserId) {
        console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - User not authenticated`);
        throw new Error('User not authenticated');
      }

      const projectId = parseInt((params as any).id || (params as any).projectId);
      if (!projectId || isNaN(projectId)) {
        console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - Invalid project ID`);
        throw new Error('Invalid project ID');
      }

      // Check if project exists
      const project = await getProjectById(projectId);
      if (!project) {
        console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - Project not found`);
        throw new Error('Project not found');
      }

      // Get user
      const user = await getByTelegramUserId(telegramUserId);
      if (!user) {
        console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - User not found`);
        throw new Error('User not found');
      }

      // Admin has access to all projects
      if (user.role === 'admin') {
        console.log(`   ✅ [checkProjectAccess] Decision: ACCEPTED - Admin access to project ${projectId}`);
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
          console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - Not a manager of project ${projectId}`);
          throw new Error('Access denied. You are not a manager of this project');
        }
        console.log(`   ✅ [checkProjectAccess] Decision: ACCEPTED - Manager access to project ${projectId}`);
      } else {
        console.log(`   ❌ [checkProjectAccess] Decision: REJECTED - Access denied. Admin or manager role required`);
        throw new Error('Access denied. Admin or manager role required');
      }

      return {
        project,
        user,
      };
    });
}

