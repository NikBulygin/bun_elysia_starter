import { t } from 'elysia';
import { checkStageAccess } from '../../../../../middleware/checkStageAccess';
import { getStageWithUsers } from '../../../../../utils/business/stage';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Get stage by ID',
  description: 'Retrieves stage information with users.',
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
      description: 'Stage information',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'Stage 1' }),
            projectId: t.Number({ example: 1 }),
            users: t.Array(t.Object({
              telegramUserId: t.Number({ example: 123456789 }),
              username: t.String({ example: 'Bulygin_Nik' }),
              role: t.Union([t.Literal('admin'), t.Literal('manager'), t.Literal('none')]),
            })),
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

export default async function handler({ stage }: { stage: any }) {
  const stageWithUsers = await getStageWithUsers(stage.id);
  return stageWithUsers;
}

