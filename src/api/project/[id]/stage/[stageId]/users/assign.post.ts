import { t } from 'elysia';
import { checkStageAccess } from '../../../../../../middleware/checkStageAccess';
import { assignUserToStageWithValidation } from '../../../../../../utils/business/stageUser';

export const middleware = [checkStageAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Assign user to stage',
  description: 'Assigns a user to a stage. Admin or project manager access required.',
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
      description: 'User assigned',
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
      description: 'User or stage not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Failed to assign user' }),
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
  const assigned = await assignUserToStageWithValidation(stageId, body.username);
  return { assigned };
}

