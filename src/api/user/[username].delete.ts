import { t } from 'elysia';
import { validateUserByUsername } from '../../middleware/validateUserByUsername';
import { checkRole } from '../../middleware/checkRole';
import { deleteUserByUsername } from '../../utils/business/user';

export const middleware = [validateUserByUsername, checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Delete user',
  description: 'Deletes user by username. Only admin can delete users.',
  params: {
    username: {
      type: 'string',
      description: 'Telegram username (without @)',
      example: 'Bulygin_Nik',
    },
  },
  responses: {
    200: {
      description: 'User deleted successfully',
      content: {
        'application/json': {
          schema: t.Object({
            message: t.String({ example: 'User deleted successfully' }),
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
            error: t.String({ example: 'User not found' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
  },
};

export default async function handler({ username }: { username: string }) {
  const deleted = await deleteUserByUsername(username);
  
  if (!deleted) {
    return {
      error: 'User not found',
      status: 404,
    };
  }

  return {
    message: 'User deleted successfully',
  };
}

