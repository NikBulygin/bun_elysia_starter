import { t } from 'elysia';
import { checkProjectAccess } from '../../middleware/checkProjectAccess';
import { getProjectWithManagers } from '../../utils/business/project';

export const middleware = [checkProjectAccess()];

export const swaggerConfig = {
  tags: ['Project'],
  summary: 'Get project by ID',
  description: 'Retrieves project information with managers. Admin or project manager access required.',
  params: {
    id: {
      type: 'number',
      example: 1,
    },
  },
  responses: {
    200: {
      description: 'Project information',
      content: {
        'application/json': {
          schema: t.Object({
            id: t.Number({ example: 1 }),
            name: t.String({ example: 'Test Project' }),
            managers: t.Array(t.Object({
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

export default async function handler({ project }: { project: any }) {
  return project;
}

