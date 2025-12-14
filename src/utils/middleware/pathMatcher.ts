/**
 * Check if a path matches a glob pattern
 * Supports:
 * - `/**` - matches all paths
 * - `/project/**` - matches all paths starting with `/project/`
 * - `/health` - exact match
 * - `/*` - matches single segment
 */
export function matchesPattern(path: string, pattern: string): boolean {
  // Exact match
  if (pattern === path) {
    return true;
  }

  // Match all pattern
  if (pattern === '/**') {
    return true;
  }

  // Wildcard at the end: /project/**
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3); // Remove '/**'
    if (path === prefix) {
      return true;
    }
    // Check if path starts with prefix followed by /
    return path.startsWith(prefix + '/');
  }
  
  // Pattern with multiple wildcards: /project/**/stage/**
  // This is a simplified check - matches if path contains the pattern structure
  if (pattern.includes('/**/')) {
    const parts = pattern.split('/**/');
    if (parts.length === 2) {
      const prefix = parts[0];
      const suffix = parts[1];
      // Path should start with prefix and contain suffix
      if (path.startsWith(prefix + '/')) {
        // Find where suffix should appear
        const pathAfterPrefix = path.slice(prefix.length);
        return pathAfterPrefix.includes('/' + suffix) || pathAfterPrefix.endsWith('/' + suffix);
      }
    }
  }

  // Single segment wildcard: /project/*
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -2); // Remove '/*'
    if (!path.startsWith(prefix + '/')) {
      return false;
    }
    const remaining = path.slice(prefix.length + 1);
    // Should not contain another '/'
    return !remaining.includes('/');
  }

  // Prefix match: /project
  if (path.startsWith(pattern + '/')) {
    return true;
  }

  return false;
}

/**
 * Check if path matches any of the patterns
 */
export function matchesAnyPattern(path: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchesPattern(path, pattern));
}

/**
 * Check if middleware should be applied to a route path
 * @param routePath - The route path to check
 * @param middlewareConfig - Middleware configuration with pathPatterns and optional excludePatterns
 */
export function shouldApplyMiddleware(
  routePath: string,
  middlewareConfig: { pathPatterns?: string[]; excludePatterns?: string[] }
): boolean {
  // If no pathPatterns specified, apply to all (backward compatibility)
  if (!middlewareConfig.pathPatterns || middlewareConfig.pathPatterns.length === 0) {
    // Check exclusions
    if (middlewareConfig.excludePatterns) {
      const matchesExclude = matchesAnyPattern(routePath, middlewareConfig.excludePatterns);
      console.log(`   🔍 [shouldApplyMiddleware] No pathPatterns, checking excludePatterns: ${routePath} matches exclude: ${matchesExclude}`);
      return !matchesExclude;
    }
    console.log(`   🔍 [shouldApplyMiddleware] No pathPatterns, no excludePatterns - applying to all`);
    return true;
  }

  // Check if path matches any include pattern
  const matchesInclude = matchesAnyPattern(routePath, middlewareConfig.pathPatterns);
  console.log(`   🔍 [shouldApplyMiddleware] Checking include patterns: ${routePath} matches ${JSON.stringify(middlewareConfig.pathPatterns)}: ${matchesInclude}`);
  if (!matchesInclude) {
    console.log(`   🔍 [shouldApplyMiddleware] Result: false (doesn't match include patterns)`);
    return false;
  }

  // Check if path matches any exclude pattern
  if (middlewareConfig.excludePatterns) {
    const matchesExclude = matchesAnyPattern(routePath, middlewareConfig.excludePatterns);
    console.log(`   🔍 [shouldApplyMiddleware] Checking exclude patterns: ${routePath} matches ${JSON.stringify(middlewareConfig.excludePatterns)}: ${matchesExclude}`);
    if (matchesExclude) {
      console.log(`   🔍 [shouldApplyMiddleware] Result: false (matches exclude pattern)`);
      return false;
    }
  }

  console.log(`   🔍 [shouldApplyMiddleware] Result: true (matches include, not excluded)`);
  return true;
}

