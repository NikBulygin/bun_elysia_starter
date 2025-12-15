import { t } from 'elysia';
import { getCredentialsSchema } from '../../utils/provider/getCredentialsSchema';

// GET requests don't require role checking - only authentication
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Get all available provider schemas (time and tasks)',
  description: 'Returns a list of all available providers (Clockify, Jira) with their credentials schemas. This endpoint shows what providers can be created, regardless of whether they exist in the database.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  responses: {
    200: {
      description: 'All available providers with their credentials schemas',
      content: {
        'application/json': {
          schema: t.Object({
            time: t.Array(
              t.Object({
                type: t.String({ example: 'time' }),
                name: t.String({ example: 'Clockify' }),
                credentialsSchema: t.Record(
                  t.String(),
                  t.Object({
                    type: t.String(),
                    required: t.Boolean(),
                    description: t.String(),
                    example: t.Optional(t.String()),
                  })
                ),
              })
            ),
            tasks: t.Array(
              t.Object({
                type: t.String({ example: 'tasks' }),
                name: t.String({ example: 'Jira' }),
                credentialsSchema: t.Record(
                  t.String(),
                  t.Object({
                    type: t.String(),
                    required: t.Boolean(),
                    description: t.String(),
                    example: t.Optional(t.String()),
                  })
                ),
              })
            ),
          }),
        },
      },
    },
  },
};

export default async function handler() {
  // Define all available providers
  const availableProviders = [
    { type: 'time' as const, name: 'Clockify' as const },
    { type: 'tasks' as const, name: 'Jira' as const },
  ];

  const result = {
    time: [] as Array<{ type: string; name: string; credentialsSchema: any }>,
    tasks: [] as Array<{ type: string; name: string; credentialsSchema: any }>,
  };

  for (const provider of availableProviders) {
    const schema = getCredentialsSchema(provider.type, provider.name);
    
    if (schema) {
      const providerData = {
        type: provider.type,
        name: provider.name,
        credentialsSchema: schema,
      };

      if (provider.type === 'time') {
        result.time.push(providerData);
      } else if (provider.type === 'tasks') {
        result.tasks.push(providerData);
      }
    }
  }

  return result;
}

