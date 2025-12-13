import { t } from 'elysia';
import { checkRole } from '../../../middleware/checkRole';
import { removeManagerFromProject } from '../../../utils/business/manager';

export const middleware = [checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Remove manager from project',
  description: 'Removes a manager from a project. Only admin can remove managers.',
  body: t.Object({
    username: t.String({ description: 'Telegram username (without @)', example: 'Bulygin_Nik' }),
    projectId: t.Number({ description: 'Project ID', example: 1 }),
  }),
  responses: {
    200: {
      description: 'Manager removed successfully',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ example: 'Manager removed successfully' }),
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
      description: 'Manager not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Manager not found or not assigned to project' }),
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

  const removed = await removeManagerFromProject(projectId, username);
  
  if (!removed) {
    return {
      error: 'Manager not found or not assigned to project',
      status: 404,
    };
  }

  return {
    message: 'Manager removed successfully',
  };
}

