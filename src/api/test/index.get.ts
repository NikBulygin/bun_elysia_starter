import { t } from 'elysia';

// Handler function
export default () => {
  return {
    message: 'Test GET endpoint',
    timestamp: new Date().toISOString(),
    endpoint: '/test',
    method: 'GET',
    availableMethods: ['GET', 'POST']
  };
};

// Swagger metadata
export const swaggerConfig = {
  tags: ['Test'],
  summary: 'Get test information',
  description: 'Returns test information and available methods for this endpoint',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ description: 'Response message' }),
            timestamp: t.String({ description: 'Current timestamp' }),
            endpoint: t.String({ description: 'Endpoint path' }),
            method: t.String({ description: 'HTTP method' }),
            availableMethods: t.Array(t.String(), { description: 'Available HTTP methods for this endpoint' })
          })
        }
      }
    }
  }
}; 