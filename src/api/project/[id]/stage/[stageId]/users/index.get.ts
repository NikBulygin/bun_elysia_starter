import { t } from 'elysia';
import { checkStageAccess } from '../../../../../../middleware/checkStageAccess';
import { getStageUsers } from '../../../../../../utils/business/stageUser';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Get stage users',
  description: 'Retrieves all users assigned to a stage.',
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
      description: 'List of users',
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
  const users = await getStageUsers(stageId);
  return users;
}

