import { t } from 'elysia';
import { DeploymentRequest, DeploymentResponse, DeploymentHandler, SwaggerConfig } from '~/types/deployments';
import { replaceYml } from '~/utils/Intergration/Github/ReplaceYml';

// Handler function
export default async ({ body, query }: { body: DeploymentRequest; query?: { details?: string } }): Promise<DeploymentResponse> => {
  try {
    console.log(`🚀 Processing deployment request: ${body.image}:${body.version}`);
    
    // Call ReplaceYml to update image versions
    const result = await replaceYml(body.image, body.version, undefined, true);
    
    if (!result.success) {
      return {
        success: false,
        image: body.image,
        version: body.version,
        timestamp: new Date().toISOString(),
        error: result.errors.join(', ')
      };
    }

    // Return response with optional details based on query parameter
    return {
      success: true,
      image: body.image,
      version: body.version,
      timestamp: new Date().toISOString(),
      ...(query?.details === 'true' ? {
        details: {
          filesChanged: result.updatedFiles.length,
          filePaths: result.updatedFiles,
          changes: result.changes,
          commitSha: result.commitSha,
          errors: result.errors.length > 0 ? result.errors : undefined
        }
      } : {})
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Deployment failed:', errorMessage);
    
    return {
      success: false,
      image: body.image,
      version: body.version,
      timestamp: new Date().toISOString(),
      error: errorMessage
    };
  }
};

// Swagger metadata
export const swaggerConfig: SwaggerConfig = {
  tags: ['Deployments'],
  summary: 'Change image version in YAML files',
  description: 'Change image version in YAML files in GitHub repository',
  query: t.Object({
    details: t.Optional(t.String({ 
      description: 'Return detailed information about changes (set to "true")',
      examples: ['true', 'false']
    }))
  }),
  body: t.Object({
    image: t.String({ 
      description: 'Docker image name',
      examples: ['ghcr.io/refty-yapi/refty-node/refty-node']
    }),
    version: t.String({ 
      description: 'Image version tag',
      examples: ['05-06-42a252']
    })
  }),
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Docker image name',
              example: 'ghcr.io/refty-yapi/refty-node/refty-node'
            },
            version: {
              type: 'string',
              description: 'Image version tag',
              example: '05-06-42a252'
            }
          },
          required: ['image', 'version']
        },
        examples: {
          'deployment-example': {
            summary: 'Example deployment request',
            value: {
              image: 'ghcr.io/refty-yapi/refty-node/refty-node',
              version: '05-06-42a252'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Deployment successful',
      content: {
        'application/json': {
          schema: t.Object({
            success: t.Boolean(),
            image: t.String(),
            version: t.String(),
            timestamp: t.String(),
            error: t.Optional(t.String()),
            details: t.Optional(t.Object({
              filesChanged: t.Number(),
              filePaths: t.Array(t.String()),
              changes: t.Array(t.Object({
                file: t.String(),
                oldVersion: t.String(),
                newVersion: t.String()
              })),
              commitSha: t.Optional(t.String()),
              errors: t.Optional(t.Array(t.String()))
            }))
          })
        }
      }
    },
    400: {
      description: 'Bad request - invalid parameters',
      content: {
        'application/json': {
          schema: t.Object({
            success: t.Boolean(),
            image: t.String(),
            version: t.String(),
            timestamp: t.String(),
            error: t.String()
          })
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: t.Object({
            success: t.Boolean(),
            image: t.String(),
            version: t.String(),
            timestamp: t.String(),
            error: t.String()
          })
        }
      }
    }
  }
}; 