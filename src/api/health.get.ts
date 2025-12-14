import { t } from 'elysia';

// Health check response type
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    github: 'ok' | 'error';
    database?: 'ok' | 'error';
  };
}

// Handler function
export default async (context: any): Promise<HealthResponse> => {
  console.log(`   ✅ Handler called for PUBLIC route (health check) - no auth required`);
  console.log(`   Context keys: ${Object.keys(context || {}).join(', ')}`);
  
  const startTime = process.uptime();
  
  // Basic health checks
  const checks = {
    github: 'ok' as const, // GitHub API connectivity would be checked here
    // database: 'ok' as const, // Add database checks if needed
  };

  // Determine overall health status
  const isHealthy = Object.values(checks).every(check => check === 'ok');
  
  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(startTime),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks
  };
};

// Swagger metadata
export const swaggerConfig = {
  tags: ['Health'],
  summary: 'Health check endpoint',
  description: 'Check application health status and uptime',
  responses: {
    200: {
      description: 'Application is healthy',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String({ example: 'healthy' }),
            timestamp: t.String({ example: '2025-07-15T06:25:05.577Z' }),
            uptime: t.Number({ example: 3600 }),
            version: t.String({ example: '1.0.0' }),
            environment: t.String({ example: 'production' }),
            checks: t.Object({
              github: t.String({ example: 'ok' }),
              database: t.Optional(t.String({ example: 'ok' }))
            })
          })
        }
      }
    },
    503: {
      description: 'Application is unhealthy',
      content: {
        'application/json': {
          schema: t.Object({
            status: t.String({ example: 'unhealthy' }),
            timestamp: t.String(),
            uptime: t.Number(),
            version: t.String(),
            environment: t.String(),
            checks: t.Object({
              github: t.String({ example: 'error' }),
              database: t.Optional(t.String({ example: 'error' }))
            })
          })
        }
      }
    }
  }
};
