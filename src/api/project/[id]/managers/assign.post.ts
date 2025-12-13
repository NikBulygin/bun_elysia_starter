import { t } from 'elysia';
import { checkProjectAccess } from '../../../../middleware/checkProjectAccess';
import { checkRole } from '../../../../middleware/checkRole';
import { assignManagerToProject } from '../../../../utils/business/manager';

export const middleware = [checkProjectAccess(), checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Assign manager to project',
  description: 'Assigns a manager to a project. Only admin can assign managers.',
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
      description: 'Manager assigned',
      content: {
        'application/json': {
          schema: t.Object({
            assigned: t.Boolean({ example: true }),
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
      description: 'User or project not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Failed to assign manager' }),
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
  const assigned = await assignManagerToProject(projectId, body.username);
  return { assigned };
}

