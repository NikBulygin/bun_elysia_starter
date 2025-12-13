import { t } from 'elysia';
import { checkRole } from '../../../middleware/checkRole';
import { assignManagerToProject } from '../../../utils/business/manager';

export const middleware = [checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Assign manager to project',
  description: 'Assigns a manager to a project. Only admin can assign managers.',
  body: t.Object({
    username: t.String({ description: 'Telegram username (without @)', example: 'Bulygin_Nik' }),
    projectId: t.Number({ description: 'Project ID', example: 1 }),
  }),
  responses: {
    200: {
      description: 'Manager assigned successfully',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ example: 'Manager assigned successfully' }),
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'username and projectId are required' }),
            status: t.Number({ example: 400 }),
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
      description: 'User or project not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Failed to assign manager. User may not exist in Telegram or already assigned.' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ body }: { body: { username: string; projectId: number } }) {
  const { username, projectId } = body;

  if (!username || !projectId) {
    return {
      error: 'username and projectId are required',
      status: 400,
    };
  }

  const assigned = await assignManagerToProject(projectId, username);
  
  if (!assigned) {
    return {
      error: 'Failed to assign manager. User may not exist in Telegram or already assigned.',
      status: 404,
    };
  }

  return {
    message: 'Manager assigned successfully',
  };
}

