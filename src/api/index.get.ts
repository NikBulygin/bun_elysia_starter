import { t } from 'elysia';

// Handler function
export default ({ query }: { query: { name?: string } }) => {
  const name = query.name || 'World';
  return {
    message: `Hello ${name}!`,
    timestamp: new Date().toISOString(),
    endpoint: '/api/',
    method: 'GET'
  };
};

// Swagger metadata
export const swaggerConfig = {
  tags: ['API'],
  summary: 'Get API greeting',
  description: 'Returns a personalized greeting message',
  query: t.Object({
    name: t.Optional(t.String({ description: 'Name to greet' }))
  }),
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ description: 'Greeting message' }),
            timestamp: t.String({ description: 'Current timestamp' }),
            endpoint: t.String({ description: 'Endpoint path' }),
            method: t.String({ description: 'HTTP method' })
          })
        }
      }
    }
  }
}; 