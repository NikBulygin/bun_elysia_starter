import { t } from 'elysia';
import { getAllProviders } from '../../utils/provider/getAll';

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Get all providers',
  description: 'Retrieves all providers.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  responses: {
    200: {
      description: 'List of providers',
      content: {
        'application/json': {
          schema: t.Array(
            t.Object({
              id: t.Number({ example: 1 }),
              type: t.String({ example: 'time' }),
              name: t.String({ example: 'Clockify' }),
              credentials: t.Record(t.String(), t.Any()),
            })
          ),
        },
      },
    },
  },
};

export default async function handler() {
  const providers = await getAllProviders();
  return providers;
}

