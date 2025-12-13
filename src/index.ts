import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { loadRoutes } from './utils/dynamicRouting/index.js';
import { initDatabase } from './db/migrate.js';

// Create application
const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Dev API Routes',
        version: '1.0.0',
        description: 'API with dynamic route loading from api/ directory'
      }
    }
  }))
  .get('/', () => ({
    message: 'Dev API Server',
    endpoints: 'Check /swagger for API documentation',
    structure: 'Routes are loaded dynamically from src/api/ directory'
  }));

// Initialize database and load routes
async function start() {
  try {
    await initDatabase();
    await loadRoutes(app);
    
    app.listen(3000);
    
    console.log(
      `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
    );
    console.log(`📖 Swagger documentation available at ${app.server?.hostname}:${app.server?.port}/swagger`);
    console.log('🔍 API routes loaded dynamically from src/api/');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

start();
