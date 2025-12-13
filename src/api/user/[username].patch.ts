import { t } from 'elysia';
import { validateUserByUsername } from '../../middleware/validateUserByUsername';
import { checkRole } from '../../middleware/checkRole';
import { updateUserFields } from '../../utils/business/user';

export const middleware = [validateUserByUsername, checkRole(['admin'])];

export const swaggerConfig = {
  tags: ['User'],
  summary: 'Update user fields',
  description: 'Updates user fields. Only admin can update roles.',
  params: {
    username: {
      type: 'string',
      description: 'Telegram username (without @)',
      example: 'Bulygin_Nik',
    },
  },
  body: t.Object({
    role: t.Optional(t.Union([t.Literal('admin'), t.Literal('manager'), t.Literal('none')], { example: 'manager' })),
  }),
  responses: {
    200: {
      description: 'Updated user information',
      content: {
        'application/json': {
          schema: t.Object({
            telegramUserId: t.Number({ example: 123456789 }),
            username: t.String({ example: 'Bulygin_Nik' }),
            role: t.Union([t.Literal('admin'), t.Literal('manager'), t.Literal('none')], { example: 'manager' }),
          }),
        },
      },
    },
    403: {
      description: 'Access denied',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Only admin can update roles' }),
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

export default async function handler(
  { username, user }: { username: string; user: any },
  { body }: { body: { role?: 'admin' | 'manager' | 'none' } }
) {
  // Only admin can update roles
  if (body.role && user.role !== 'admin') {
    return {
      error: 'Only admin can update roles',
      status: 403,
    };
  }

  const updated = await updateUserFields(username, body);
  
  if (!updated) {
    return {
      error: 'User not found',
      status: 404,
    };
  }

  return {
    telegramUserId: updated.telegramUserId,
    username: updated.username,
    role: updated.role,
  };
}

