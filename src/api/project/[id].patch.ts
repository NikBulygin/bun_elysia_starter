import { t } from 'elysia';
import { checkProjectAccess } from '../../middleware/checkProjectAccess';
import { updateProjectWithValidation } from '../../utils/business/project';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Update project',
  description: 'Updates project fields. Admin or project manager access required.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  body: t.Object({
    name: t.Optional(t.String({ example: 'Updated Project Name' })),
  }),
  responses: {
    200: {
      description: 'Project updated',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'Updated Project Name' }),
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
  { body }: { body: { name?: string } }
) {
  const projectId = parseInt(params.id);
  const updated = await updateProjectWithValidation(projectId, body);
  return updated;
}

