import { t } from 'elysia';
import { getCredentialsSchema } from '../../../../utils/provider/getCredentialsSchema';
import type { ProviderType, ProviderName } from '../../../../providers/validators';

// GET requests don't require role checking - only authentication
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Get credentials schema for provider (time or tasks)',
  description: 'Returns the structure of credentials required for a specific provider type and name.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  params: {
    type: {
      type: 'string',
      description: 'Provider type (time or tasks)',
      example: 'time',
    },
    name: {
      type: 'string',
      description: 'Provider name (e.g., Clockify, Jira)',
      example: 'Clockify',
    },
  },
  responses: {
    200: {
      description: 'Credentials schema for the provider',
      content: {
        'application/json': {
          schema: t.Record(
            t.String(),
            t.Object({
              type: t.Union([t.Literal('string'), t.Literal('number'), t.Literal('boolean')]),
              required: t.Boolean(),
              description: t.Optional(t.String()),
            })
          ),
        },
      },
    },
    400: {
      description: 'Invalid provider type or name',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Invalid provider type or name' }),
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
  },
};

export default async function handler({
  params,
}: {
  params: { type: string; name: string };
}) {
  const { type, name } = params;

  // Validate provider type
  if (type !== 'time' && type !== 'tasks') {
    return {
      error: 'Invalid provider type. Must be "time" or "tasks"',
      status: 400,
    };
  }

  // Validate provider name
  const validNames: ProviderName[] = ['Clockify', 'Jira'];
  if (!validNames.includes(name as ProviderName)) {
    return {
      error: `Invalid provider name. Must be one of: ${validNames.join(', ')}`,
      status: 400,
    };
  }

  // Get credentials schema
  const schema = getCredentialsSchema(type as ProviderType, name as ProviderName);

  if (!schema) {
    return {
      error: 'Provider not found',
      status: 404,
    };
  }

  return schema;
}

