import { t } from 'elysia';
import { checkRole } from '../../middleware/checkRole';
import { createProjectWithValidation } from '../../utils/business/project';

export const middleware = [checkRole(['admin', 'manager'])];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Create project',
  description: 'Creates a new project. Only admin and manager can create projects.',
  body: t.Object({
    name: t.String({ example: 'New Project' }),
  }),
  responses: {
    200: {
      description: 'Project created',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'New Project' }),
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
  },
};

export default async function handler({ body }: { body: { name: string } }) {
  const project = await createProjectWithValidation(body);
  return project;
}

