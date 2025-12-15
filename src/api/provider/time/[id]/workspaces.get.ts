import { t } from 'elysia';
import { getProviderById } from '../../../../utils/provider/getById';
import { createTimeProvider } from '../../../../providers/factory';
import type { ProviderName } from '../../../../providers/validators';

// GET requests don't require role checking - only authentication
export const middleware = [];

export const swaggerConfig = {
  tags: ['Provider/Time'],
  summary: 'Get workspaces for time provider',
  description: 'Retrieves all workspaces for a Clockify (time) provider. Supports filtering by roles.',
  headers: {
    'X-Telegram-Init-Data': {
      description: 'Telegram Mini App initData for authentication',
      type: 'string',
      required: true,
    },
  },
  params: {
    id: {
      type: 'number',
      description: 'Time provider ID',
      example: 1,
    },
  },
  query: {
    roles: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['WORKSPACE_ADMIN', 'OWNER', 'TEAM_MANAGER', 'PROJECT_MANAGER'],
      },
      description: 'Filter workspaces by roles',
      required: false,
    },
  },
  responses: {
    200: {
      description: 'List of workspaces',
      content: {
        'application/json': {
          schema: t.Array(
            t.Object({
              id: t.String({ example: '64a687e29ae1f428e7ebe303' }),
              name: t.String({ example: 'Cool Company' }),
              cakeOrganizationId: t.Optional(t.String()),
              imageUrl: t.Optional(t.String()),
              featureSubscriptionType: t.Optional(t.String()),
              features: t.Optional(t.Array(t.String())),
              workspaceSettings: t.Optional(t.Record(t.String(), t.Any())),
              subdomain: t.Optional(t.Record(t.String(), t.Any())),
              costRate: t.Optional(
                t.Object({
                  amount: t.Optional(t.Number()),
                  currency: t.Optional(t.String()),
                })
              ),
              hourlyRate: t.Optional(
                t.Object({
                  amount: t.Optional(t.Number()),
                  currency: t.Optional(t.String()),
                })
              ),
              currencies: t.Optional(t.Array(t.Any())),
              memberships: t.Optional(t.Array(t.Any())),
            })
          ),
        },
      },
    },
    400: {
      description: 'Invalid provider ID or provider is not a time provider',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Provider is not a time provider' }),
            status: t.Number({ example: 400 }),
          }),
        },
      },
    },
    404: {
      description: 'Provider not found',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Provider not found' }),
            status: t.Number({ example: 404 }),
          }),
        },
      },
    },
    500: {
      description: 'Error calling Clockify API',
      content: {
        'application/json': {
          schema: t.Object({
            error: t.String({ example: 'Clockify API error: 401 Unauthorized' }),
            status: t.Number({ example: 500 }),
          }),
        },
      },
    },
  },
};

export default async function handler({
  params,
  query,
}: {
  params: { id: string | number };
  query?: { roles?: string | string[] };
}) {
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : params.id;

  if (isNaN(id) || id <= 0) {
    return {
      error: 'Invalid provider ID',
      status: 400,
    };
  }

  // Get provider from database
  const provider = await getProviderById(id);

  if (!provider) {
    return {
      error: 'Provider not found',
      status: 404,
    };
  }

  // Check if provider is a time provider (Clockify)
  if (provider.type !== 'time') {
    return {
      error: 'Provider is not a time provider',
      status: 400,
    };
  }

  if (provider.name !== 'Clockify') {
    return {
      error: 'Only Clockify provider supports workspaces',
      status: 400,
    };
  }

  try {
    // Create provider instance
    const clockifyProvider = createTimeProvider(provider.name as ProviderName, provider.credentials);

    // Parse roles filter from query
    // Elysia may pass roles as string or array depending on URL format
    let roles: string[] | undefined;
    if (query?.roles) {
      if (Array.isArray(query.roles)) {
        roles = query.roles;
      } else if (typeof query.roles === 'string') {
        // Handle comma-separated string: "WORKSPACE_ADMIN,OWNER"
        roles = query.roles.split(',').map(r => r.trim()).filter(r => r.length > 0);
      }
    }

    // Get workspaces
    const workspaces = await clockifyProvider.getWorkspaces({ roles });

    return workspaces;
  } catch (error: any) {
    console.error('Error getting workspaces:', error);
    return {
      error: error.message || 'Failed to get workspaces',
      status: 500,
    };
  }
}

