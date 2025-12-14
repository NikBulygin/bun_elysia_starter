import { t } from 'elysia';
import { validateProviderById, validateAllProviders } from '../../utils/provider/validate';

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Validate provider connection',
  description: 'Validates provider connection by id or validates all providers. Returns validation results.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  body: t.Object({
    id: t.Optional(t.Number({ example: 1, description: 'Provider ID to validate. If not provided, validates all providers.' })),
  }),
  responses: {
    200: {
      description: 'Validation result(s)',
      content: {
        'application/json': {
          schema: t.Union([
            t.Object({
              id: t.Number({ example: 1 }),
              name: t.String({ example: 'Clockify' }),
              type: t.String({ example: 'time' }),
              valid: t.Boolean({ example: true }),
              error: t.Optional(t.String()),
            }),
            t.Array(
              t.Object({
                id: t.Number({ example: 1 }),
                name: t.String({ example: 'Clockify' }),
                type: t.String({ example: 'time' }),
                valid: t.Boolean({ example: true }),
                error: t.Optional(t.String()),
              })
            ),
          ]),
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
  body,
}: {
  body?: { id?: number };
}) {
  if (body?.id !== undefined) {
    // Validate single provider
    const id = typeof body.id === 'string' ? parseInt(body.id, 10) : body.id;

    if (isNaN(id) || id <= 0) {
      return {
        error: 'Invalid provider ID',
        status: 400,
      };
    }

    const result = await validateProviderById(id);

    if (!result) {
      return {
        error: 'Provider not found',
        status: 404,
      };
    }

    return result;
  }

  // Validate all providers
  const results = await validateAllProviders();
  return results;
}

