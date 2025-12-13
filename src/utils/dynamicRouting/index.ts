import { Elysia } from "elysia";
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { validateInitDataMiddleware } from '../../middleware/validateInitData';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes that don't require initData validation
const publicRoutes = ['/health', '/'];
const publicRoutePrefixes = ['/auth', '/bot'];

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
      // Create route instance with middleware
      let routeInstance = new Elysia();
      
      // Check if route is public (doesn't require initData validation)
      const isPublicRoute = publicRoutes.includes(fullRoutePath) || 
                           publicRoutePrefixes.some(prefix => fullRoutePath.startsWith(prefix));
      
      // Apply initData validation middleware for non-public routes
      if (!isPublicRoute) {
        routeInstance = routeInstance.use(validateInitDataMiddleware);
      }
      
      // Apply route-specific middleware in order
      if (Array.isArray(middleware)) {
        for (const mw of middleware) {
          if (mw) {
            routeInstance = routeInstance.use(mw);
          }
        }
      } else if (middleware) {
        routeInstance = routeInstance.use(middleware);
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
