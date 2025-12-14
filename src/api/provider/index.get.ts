import { t } from 'elysia';
import { getAllProvidersGroupedByType } from '../../utils/provider/getAllWithStatus';

// GET requests don't require role checking - only authentication
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Get all providers grouped by type',
  description: 'Retrieves all providers grouped by type (time and tasks) with their connection status. Credentials are not returned for security reasons.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Providers grouped by type',
      content: {
        'application/json': {
          schema: t.Object({
            time: t.Array(
              t.Object({
                id: t.Number({ example: 1 }),
                type: t.String({ example: 'time' }),
                name: t.String({ example: 'Clockify' }),
                isWork: t.Boolean({ example: true, description: 'Whether the provider connection is working' }),
              })
            ),
            tasks: t.Array(
              t.Object({
                id: t.Number({ example: 2 }),
                type: t.String({ example: 'tasks' }),
                name: t.String({ example: 'Jira' }),
                isWork: t.Boolean({ example: true, description: 'Whether the provider connection is working' }),
              })
            ),
          }),
        },
      },
    },
  },
};

export default async function handler() {
  const providers = await getAllProvidersGroupedByType();
  return providers;
}

