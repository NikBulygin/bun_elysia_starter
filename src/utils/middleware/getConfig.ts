// Map of middleware functions to their configs
// We store references to the original functions to identify middleware instances
const middlewareConfigMap = new WeakMap();

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
  // Note: checkRole, checkProjectAccess, checkStageAccess middleware have been removed
  // This function now only handles middleware with explicit config properties

  // Check if middleware has a config property (for future extensibility)
  if (middleware.middlewareConfig) {
    console.log(`   🔍 [getMiddlewareConfig] Found middlewareConfig property`);
    middlewareConfigMap.set(middleware, middleware.middlewareConfig);
    return middleware.middlewareConfig;
  }

  console.log(`   🔍 [getMiddlewareConfig] No config found for middleware: ${middlewareName || 'unknown'}`);
  return undefined;
}

