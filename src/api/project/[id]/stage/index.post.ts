import { t } from 'elysia';
import { checkProjectAccess } from '../../../../middleware/checkProjectAccess';
import { createStageWithValidation } from '../../../../utils/business/stage';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Stage'],
  summary: 'Create stage',
  description: 'Creates a new stage in a project. Admin or project manager access required.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  body: t.Object({
    name: t.String({ example: 'New Stage' }),
  }),
  responses: {
    200: {
      description: 'Stage created',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'New Stage' }),
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

export default async function handler(
  { params }: { params: { id: string } },
  { body }: { body: { name: string } }
) {
  const projectId = parseInt(params.id);
  const stage = await createStageWithValidation({ name: body.name, projectId });
  return stage;
}

