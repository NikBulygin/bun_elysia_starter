import { t } from 'elysia';
import { getAllProjectsWithAccess } from '../../utils/business/project';

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Get all projects',
  description: 'Retrieves projects for the authenticated user with pagination. Admin sees all, manager sees assigned projects, regular users see projects where they participate through stages.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  query: {
    offset: {
      type: 'number',
      description: 'Pagination offset',
      example: 0,
      default: 0,
    },
    limit: {
      type: 'number',
      description: 'Pagination limit',
      example: 10,
      default: 10,
    },
  },
  responses: {
    200: {
      description: 'Paginated list of projects',
      content: {
        'application/json': {
          schema: t.Object({
            projects: t.Array(t.Object({
              id: t.Number({ example: 1 }),
              name: t.String({ example: 'Test Project' }),
            })),
            total: t.Number({ example: 25, description: 'Total number of projects' }),
            offset: t.Number({ example: 0 }),
            limit: t.Number({ example: 10 }),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized - invalid or missing initData',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Invalid initData signature' }),
            status: t.Number({ example: 401 }),
          }),
        },
      },
    },
  },
};

export default async function handler({
  telegramUserId,
  query,
}: {
  telegramUserId: number;
  query?: { offset?: number; limit?: number };
}) {
  const offset = query?.offset ? parseInt(String(query.offset), 10) : 0;
  const limit = query?.limit ? parseInt(String(query.limit), 10) : 10;

  if (isNaN(offset) || offset < 0) {
    return {
      error: 'Invalid offset parameter',
      status: 400,
    };
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return {
      error: 'Invalid limit parameter (must be between 1 and 100)',
      status: 400,
    };
  }

  const result = await getAllProjectsWithAccess(telegramUserId, offset, limit);
  return result;
}

