import { t } from 'elysia';
import { deleteProvider } from '../../utils/provider/delete';

// DELETE requests require authentication but no role checking at this stage
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider'],
  summary: 'Delete provider (time or tasks)',
  description: 'Deletes a provider by id. Only admin can delete providers.',
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
      description: 'Provider deleted',
      content: {
        'application/json': {
          schema: t.Object({
            success: t.Boolean({ example: true }),
            message: t.String({ example: 'Provider deleted successfully' }),
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

  const deleted = await deleteProvider(id);

  if (!deleted) {
    return {
      error: 'Provider not found',
      status: 404,
    };
  }

  return {
    success: true,
    message: 'Provider deleted successfully',
  };
}

