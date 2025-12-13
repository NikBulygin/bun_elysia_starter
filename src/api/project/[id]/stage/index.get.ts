import { t } from 'elysia';
import { checkProjectAccess } from '../../../../middleware/checkProjectAccess';
import { getStagesByProjectWithUsers } from '../../../../utils/business/stage';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Get project stages',
  description: 'Retrieves all stages for a project.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  responses: {
    200: {
      description: 'List of stages',
      content: {
        'application/json': {
          schema: t.Array(t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'Stage 1' }),
            projectId: t.Number({ example: 1 }),
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
  const stages = await getStagesByProjectWithUsers(projectId);
  return stages;
}

