import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import { loadRoutes } from './utils/dynamicRouting/index.js';
import { initDatabase } from './db/migrate.js';
import './bot/index.js';

// Create application
const app = new Elysia()
  .onRequest(({ request }) => {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    console.log(`\n🌐 Incoming Request: ${method} ${path}`);
  })
  .use(swagger({
    documentation: {
      info: {
        title: 'Dev API Routes',
        version: '1.0.0',
        description: 'API with dynamic route loading from api/ directory. All endpoints (except /health and /) require X-Telegram-Init-Data header for authentication.'
      },
      components: {
        securitySchemes: {
          telegramInitData: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Telegram-Init-Data',
            description: 'Telegram Mini App initData for authentication. Must be valid HMAC-SHA256 signed data.'
          }
        }
      }
    }
  }))
  .get('/', () => {
    console.log(`   ✅ Decision: PUBLIC route - no auth required`);
    return {
      message: 'Dev API Server',
      endpoints: 'Check /swagger for API documentation',
      structure: 'Routes are loaded dynamically from src/api/ directory'
    };
  });

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
