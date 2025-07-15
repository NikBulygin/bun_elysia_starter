import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { loadRoutes } from './utils/dynamicRouting/index.js';

// Create application
const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Dynamic API Routes',
        version: '1.0.0',
        description: 'API with dynamic route loading from api/ directory'
      }
    }
  }))
  .get('/', () => ({
    message: 'Dynamic API Server',
    endpoints: 'Check /swagger for API documentation',
    structure: 'Routes are loaded dynamically from src/api/ directory'
  }));

// Load routes dynamically
loadRoutes(app).then(() => {
  app.listen(3000);
  
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
  console.log('📖 Swagger documentation available at /swagger');
  console.log('🔍 API routes loaded dynamically from src/api/');
});
