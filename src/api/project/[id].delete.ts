import { t } from 'elysia';
import { checkProjectAccess } from '../../middleware/checkProjectAccess';
import { deleteProjectWithValidation } from '../../utils/business/project';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Delete project',
  description: 'Deletes a project. Admin or project manager access required.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  responses: {
    200: {
      description: 'Project deleted',
      content: {
        'application/json': {
          schema: t.Object({
            deleted: t.Boolean({ example: true }),
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
  const deleted = await deleteProjectWithValidation(projectId);
  return { deleted };
}

