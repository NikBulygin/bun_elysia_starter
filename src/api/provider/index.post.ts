import { t } from 'elysia';
import { createProvider } from '../../utils/provider/create';

// POST requests require authentication but no role checking at this stage
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Create provider',
  description: 'Creates a new provider with credentials validation. Only admin can create providers.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  body: t.Object({
    type: t.Union([t.Literal('time'), t.Literal('tasks')], { example: 'time' }),
    name: t.Union([t.Literal('Clockify'), t.Literal('Jira')], { example: 'Clockify' }),
    credentials: t.Record(t.String(), t.Any(), {
      example: { token: 'your-token-here' },
      description: 'Provider credentials (structure depends on provider type)',
    }),
  }),
  responses: {
    200: {
      description: 'Provider created',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            type: t.String({ example: 'time' }),
            name: t.String({ example: 'Clockify' }),
            credentials: t.Record(t.String(), t.Any()),
          }),
        },
      },
    },
    400: {
      description: 'Invalid credentials',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Invalid credentials for Clockify provider' }),
            status: t.Number({ example: 400 }),
          }),
        },
      },
    },
    403: {
      description: 'Access denied',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Access denied' }),
            status: t.Number({ example: 403 }),
          }),
        },
      },
    },
  },
};

export default async function handler({
  body,
}: {
  body: { type: 'time' | 'tasks'; name: 'Clockify' | 'Jira'; credentials: Record<string, unknown> };
}) {
  try {
    const provider = await createProvider(body);
    return provider;
  } catch (error: any) {
    return {
      error: error.message || 'Failed to create provider',
      status: 400,
    };
  }
}

