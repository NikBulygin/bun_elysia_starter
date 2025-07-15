import { t } from 'elysia';

// Handler function
export default ({ body }: { body: any }) => {
  return {
    message: 'Test POST endpoint',
    receivedData: body,
    timestamp: new Date().toISOString(),
    endpoint: '/test',
    method: 'POST'
  };
};

// Swagger metadata
export const swaggerConfig = {
  tags: ['Test'],
  summary: 'Create test data',
  description: 'Accepts test data and returns confirmation',
  body: t.Object({
    name: t.String({ description: 'Test name' }),
    value: t.Optional(t.String({ description: 'Test value' }))
  }),
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ description: 'Response message' }),
            receivedData: t.Any({ description: 'Received request body' }),
            timestamp: t.String({ description: 'Current timestamp' }),
            endpoint: t.String({ description: 'Endpoint path' }),
            method: t.String({ description: 'HTTP method' })
          })
        }
      }
    }
  }
};
