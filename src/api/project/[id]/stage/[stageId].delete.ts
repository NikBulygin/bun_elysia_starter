import { t } from 'elysia';
import { checkStageAccess } from '../../../../../middleware/checkStageAccess';
import { deleteStageWithValidation } from '../../../../../utils/business/stage';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Delete stage',
  description: 'Deletes a stage.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
    stageId: {
      type: 'number',
      example: 1,
    },
  },
  responses: {
    200: {
      description: 'Stage deleted',
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
      description: 'Stage not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Stage not found' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ params }: { params: { stageId: string } }) {
  const stageId = parseInt(params.stageId);
  const deleted = await deleteStageWithValidation(stageId);
  return { deleted };
}

