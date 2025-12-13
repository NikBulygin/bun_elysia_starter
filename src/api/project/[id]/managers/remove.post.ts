import { t } from 'elysia';
import { checkProjectAccess } from '../../../../middleware/checkProjectAccess';
import { checkRole } from '../../../../middleware/checkRole';
import { removeManagerFromProject } from '../../../../utils/business/manager';

export const middleware = [checkProjectAccess(), checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Remove manager from project',
  description: 'Removes a manager from a project. Only admin can remove managers.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  body: t.Object({
    username: t.String({ example: 'Bulygin_Nik' }),
  }),
  responses: {
    200: {
      description: 'Manager removed',
      content: {
        'application/json': {
          schema: t.Object({
            removed: t.Boolean({ example: true }),
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
    404: {
      description: 'Manager not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Manager not found or not assigned to project' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler(
  { params }: { params: { id: string } },
  { body }: { body: { username: string } }
) {
  const projectId = parseInt(params.id);
  const removed = await removeManagerFromProject(projectId, body.username);
  return { removed };
}

