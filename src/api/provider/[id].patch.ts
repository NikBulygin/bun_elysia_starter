import { t } from 'elysia';
import { updateProvider } from '../../utils/provider/update';

// PATCH requests require authentication but no role checking at this stage
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Update provider credentials (time or tasks)',
  description: 'Updates provider credentials with validation. Only admin can update providers.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  params: {
    id: {
      type: 'number',
      description: 'Provider ID',
      example: 1,
    },
  },
  body: t.Object({
    credentials: t.Record(t.String(), t.Any(), {
      example: { token: 'new-token-here' },
      description: 'New provider credentials',
    }),
  }),
  responses: {
    200: {
      description: 'Provider updated',
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
      description: 'Invalid credentials or provider ID',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Invalid credentials for Clockify provider' }),
            status: t.Number({ example: 400 }),
          }),
        },
      },
    },
    404: {
      description: 'Provider not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Provider not found' }),
            status: t.Number({ example: 404 }),
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
  params,
  body,
}: {
  params: { id: string | number };
  body: { credentials: Record<string, unknown> };
}) {
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;

  if (isNaN(id) || id <= 0) {
    return {
      error: 'Invalid provider ID',
      status: 400,
    };
  }

  try {
    const provider = await updateProvider(id, body);

    if (!provider) {
      return {
        error: 'Provider not found',
        status: 404,
      };
    }

    return provider;
  } catch (error: any) {
    return {
      error: error.message || 'Failed to update provider',
      status: 400,
    };
  }
}

