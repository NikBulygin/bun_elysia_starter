import { t } from 'elysia';
import { checkProjectAccess } from '../../../../middleware/checkProjectAccess';
import { getProjectManagers } from '../../../../utils/business/manager';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Get project managers',
  description: 'Retrieves all managers assigned to a project.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  responses: {
    200: {
      description: 'List of managers',
      content: {
        'application/json': {
          schema: t.Array(t.Object({
            telegramUserId: t.Number({ example: 123456789 }),
            username: t.String({ example: 'Bulygin_Nik' }),
            role: t.Union([t.Literal('admin'), t.Literal('manager'), t.Literal('none')]),
          })),
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
    404: {
      description: 'Project not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Project not found' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const managers = await getProjectManagers(projectId);
  return managers;
}

