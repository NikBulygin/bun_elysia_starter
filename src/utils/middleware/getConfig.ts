import { checkRole, checkRoleMiddlewareConfig } from '../../middleware/checkRole';
import { checkProjectAccess, checkProjectAccessMiddlewareConfig } from '../../middleware/checkProjectAccess';
import { checkStageAccess, checkStageAccessMiddlewareConfig } from '../../middleware/checkStageAccess';

// Map of middleware functions to their configs
// We store references to the original functions to identify middleware instances
const middlewareConfigMap = new WeakMap();

// Store configs for known middleware functions
// This allows us to identify middleware instances created by these functions
let middlewareIdCounter = 0;
const middlewareFunctionIds = new WeakMap();

// Mark known middleware functions
middlewareFunctionIds.set(checkRole, 'checkRole');
middlewareFunctionIds.set(checkProjectAccess, 'checkProjectAccess');
middlewareFunctionIds.set(checkStageAccess, 'checkStageAccess');

/**
 * Get middleware configuration by checking if it's one of our known middleware functions
 * Since middleware functions are called (e.g., checkRole(['admin'])), we check
 * the returned Elysia instance properties or string representation
 */
export function getMiddlewareConfig(middleware: any): { pathPatterns?: string[]; excludePatterns?: string[] } | undefined {
  if (!middleware) {
    return undefined;
  }

  // Check if middleware has a stored config (from previous identification)
  if (middlewareConfigMap.has(middleware)) {
    const config = middlewareConfigMap.get(middleware);
    console.log(`   🔍 [getMiddlewareConfig] Found cached config for middleware`);
    return config;
  }

  // Check if middleware is an Elysia instance (returned from middleware function)
  const middlewareString = String(middleware);
  const middlewareName = middleware.name || '';
  
  // Check known middleware by string representation
  // Elysia instances from our middleware functions contain specific patterns
  
  if (middlewareString.includes('allowedRoles') || 
      (middlewareString.includes('User not authenticated') && middlewareString.includes('role'))) {
    console.log(`   🔍 [getMiddlewareConfig] Identified as checkRole middleware`);
    middlewareConfigMap.set(middleware, checkRoleMiddlewareConfig);
    return checkRoleMiddlewareConfig;
  }
  
  if (middlewareString.includes('projectId') && 
      (middlewareString.includes('checkProjectAccess') ||
      (middlewareString.includes('Project not found') && middlewareString.includes('manager')))) {
    console.log(`   🔍 [getMiddlewareConfig] Identified as checkProjectAccess middleware`);
    middlewareConfigMap.set(middleware, checkProjectAccessMiddlewareConfig);
    return checkProjectAccessMiddlewareConfig;
  }
  
  if (middlewareString.includes('stageId') && 
      (middlewareString.includes('checkStageAccess') ||
      (middlewareString.includes('Stage not found') && middlewareString.includes('manager')))) {
    console.log(`   🔍 [getMiddlewareConfig] Identified as checkStageAccess middleware`);
    middlewareConfigMap.set(middleware, checkStageAccessMiddlewareConfig);
    return checkStageAccessMiddlewareConfig;
  }

  // Check if middleware has a config property (for future extensibility)
  if (middleware.middlewareConfig) {
    console.log(`   🔍 [getMiddlewareConfig] Found middlewareConfig property`);
    middlewareConfigMap.set(middleware, middleware.middlewareConfig);
    return middleware.middlewareConfig;
  }

  console.log(`   🔍 [getMiddlewareConfig] No config found for middleware: ${middlewareName || 'unknown'}`);
  return undefined;
}

