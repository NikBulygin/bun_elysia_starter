import { Elysia } from "elysia";
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { validateInitDataMiddleware, validateInitDataMiddlewareConfig } from '../../middleware/validateInitData';
import { shouldApplyMiddleware } from '../middleware/pathMatcher';
import { getMiddlewareConfig } from '../middleware/getConfig';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to dynamically load routes
export async function loadRoutes(app: Elysia) {
  const apiPath = join(__dirname, '../../api');
  
  async function scanDirectory(dirPath: string, routePath: string = '') {
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        const fullPath = join(dirPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          // Recursively scan subdirectories
          const newRoutePath = routePath ? `${routePath}/${item}` : `/${item}`;
          await scanDirectory(fullPath, newRoutePath);
        } else if (stats.isFile() && extname(item) === '.ts') {
          // Process TypeScript files
          await processRouteFile(app, fullPath, routePath, item);
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }
  
  await scanDirectory(apiPath);
}

// Function to process route file
async function processRouteFile(app: Elysia, filePath: string, routePath: string, fileName: string) {
  try {
    // Determine HTTP method from file name
    const method = extractMethodFromFileName(fileName);
    if (!method) {
      console.log(`Skipping ${fileName} - no HTTP method found`);
      return;
    }
    
    // Determine route path
    const routeName = extractRouteName(fileName);
    const fullRoutePath = routePath + (routeName === 'index' ? '' : `/${routeName}`);
    
    // Create absolute import path using file:// protocol
    const importPath = `file://${filePath}`;
    
    // Dynamically import module
    const module = await import(importPath);
    
    // Find handler, swagger config, and middleware in module
    const handler = module.default || module.handler || module[method];
    const swaggerConfig = module.swaggerConfig;
    const middleware = module.middleware || [];
    
    if (handler && typeof handler === 'function') {
      // Log route registration
      console.log(`📋 Registering route: ${method.toUpperCase()} ${fullRoutePath}`);
      console.log(`   File: ${fileName}, RouteName: ${routeName}, RoutePath: "${routePath}"`);
      
      // Apply initData validation middleware based on path patterns
      const shouldApply = shouldApplyMiddleware(fullRoutePath, validateInitDataMiddlewareConfig);
      
      // Create route instance with middleware
      let routeInstance = new Elysia();
      
      if (shouldApply) {
        routeInstance = routeInstance.use(validateInitDataMiddleware);
        console.log(`   ✅ Applied validateInitDataMiddleware (matches pattern)`);
      } else {
        console.log(`   ⏭️  Skipped validateInitDataMiddleware (path excluded: ${fullRoutePath})`);
      }
      
      // Apply route-specific middleware in order, checking path patterns
      if (Array.isArray(middleware)) {
        for (const mw of middleware) {
          if (mw) {
            const middlewareConfig = getMiddlewareConfig(mw);
            
            // If no config found, apply middleware (backward compatibility)
            // Otherwise check if should apply based on path patterns
            if (!middlewareConfig || shouldApplyMiddleware(fullRoutePath, middlewareConfig)) {
              routeInstance = routeInstance.use(mw);
              console.log(`   ✅ Applied middleware: ${mw.name || 'unknown'}`);
            } else {
              console.log(`   ⏭️  Skipped middleware: ${mw.name || 'unknown'} (path excluded: ${fullRoutePath})`);
            }
          }
        }
      } else if (middleware) {
        // Single middleware
        const middlewareConfig = getMiddlewareConfig(middleware);
        const middlewareName = (middleware as any).name || '';
        
        if (!middlewareConfig || shouldApplyMiddleware(fullRoutePath, middlewareConfig)) {
          routeInstance = routeInstance.use(middleware);
          console.log(`   ✅ Applied middleware: ${middlewareName || 'unknown'}`);
        } else {
          console.log(`   ⏭️  Skipped middleware: ${middlewareName || 'unknown'} (path excluded: ${fullRoutePath})`);
        }
      }
      
      // Register route with swagger config if available
      const routeConfig = swaggerConfig ? { detail: swaggerConfig } : undefined;
      
      switch (method) {
        case 'get':
          routeInstance.get(fullRoutePath, handler, routeConfig);
          break;
        case 'post':
          routeInstance.post(fullRoutePath, handler, routeConfig);
          break;
        case 'put':
          routeInstance.put(fullRoutePath, handler, routeConfig);
          break;
        case 'delete':
          routeInstance.delete(fullRoutePath, handler, routeConfig);
          break;
        case 'patch':
          routeInstance.patch(fullRoutePath, handler, routeConfig);
          break;
        default:
          console.log(`Unsupported method: ${method} for ${fullRoutePath}`);
      }
      
      // Merge route instance into main app
      app.use(routeInstance);
      
      console.log(`✅ Registered ${method.toUpperCase()} ${fullRoutePath} -> ${importPath}`);
    } else {
      console.log(`⚠️  No handler found in ${importPath} for method ${method}`);
    }
  } catch (error) {
    console.error(`Error processing route file ${filePath}:`, error);
  }
}

// Extract HTTP method from file name
function extractMethodFromFileName(fileName: string): string | null {
  const methodMatch = fileName.match(/\.(get|post|put|delete|patch)\.ts$/);
  return methodMatch ? methodMatch[1] : null;
}

// Extract route name from file name
function extractRouteName(fileName: string): string {
  // Remove extension and method
  const nameWithoutExt = fileName.replace(/\.(get|post|put|delete|patch)\.ts$/, '');
  return nameWithoutExt === 'index' ? 'index' : nameWithoutExt;
}
