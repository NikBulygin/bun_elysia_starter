import { t } from 'elysia';
import { checkStageAccess } from '../../../../../middleware/checkStageAccess';
import { updateStageWithValidation } from '../../../../../utils/business/stage';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Update stage',
  description: 'Updates stage fields.',
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
  body: t.Object({
    name: t.Optional(t.String({ example: 'Updated Stage Name' })),
  }),
  responses: {
    200: {
      description: 'Stage updated',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'Updated Stage Name' }),
            projectId: t.Number({ example: 1 }),
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

export default async function handler(
  { params }: { params: { stageId: string } },
  { body }: { body: { name?: string } }
) {
  const stageId = parseInt(params.stageId);
  const updated = await updateStageWithValidation(stageId, body);
  return updated;
}

