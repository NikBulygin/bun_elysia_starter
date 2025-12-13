import { t } from 'elysia';
import { checkStageAccess } from '../../../../../../middleware/checkStageAccess';
import { removeUserFromStageWithValidation } from '../../../../../../utils/business/stageUser';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Remove user from stage',
  description: 'Removes a user from a stage. Admin or project manager access required.',
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
    username: t.String({ example: 'Bulygin_Nik' }),
  }),
  responses: {
    200: {
      description: 'User removed',
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
      description: 'User not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'User not found or not assigned to stage' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler(
  { params }: { params: { stageId: string } },
  { body }: { body: { username: string } }
) {
  const stageId = parseInt(params.stageId);
  const removed = await removeUserFromStageWithValidation(stageId, body.username);
  return { removed };
}

