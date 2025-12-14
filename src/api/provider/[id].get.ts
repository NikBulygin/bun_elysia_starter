import { t } from 'elysia';
import { getProviderByIdWithStatus } from '../../utils/provider/getByIdWithStatus';

// GET requests don't require role checking - only authentication
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Get provider by id',
  description: 'Retrieves a provider by its id with connection status. Credentials are not returned for security reasons.',
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
  responses: {
    200: {
      description: 'Provider found',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            type: t.String({ example: 'time' }),
            name: t.String({ example: 'Clockify' }),
            isWork: t.Boolean({ example: true, description: 'Whether the provider connection is working' }),
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
  },
};

export default async function handler({
  params,
}: {
  params: { id: string | number };
}) {
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;

  if (isNaN(id) || id <= 0) {
    return {
      error: 'Invalid provider ID',
      status: 400,
    };
  }

  const provider = await getProviderByIdWithStatus(id);

  if (!provider) {
    return {
      error: 'Provider not found',
      status: 404,
    };
  }

  return provider;
}

