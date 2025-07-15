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
  description: 'Change image version in YAML files in GitHub repository. Query param: `details` (set to "true" for detailed info).',
  parameters: [
    {
      name: 'details',
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['true', 'false'], default: 'false' },
      description: 'Return detailed information about changes. Set to "true" to get file paths, changes, and commit SHA.'
    }
  ],
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
          schema: {
            oneOf: [
              {
                type: 'object',
                description: 'Response without details (default)',
                properties: {
                  success: { type: 'boolean', example: true },
                  image: { type: 'string', example: 'ghcr.io/refty-yapi/refty-node/refty-node' },
                  version: { type: 'string', example: '05-06-42a252' },
                  timestamp: { type: 'string', example: '2025-07-15T06:25:05.577Z' }
                },
                required: ['success', 'image', 'version', 'timestamp']
              },
              {
                type: 'object',
                description: 'Response with details (when details=true)',
                properties: {
                  success: { type: 'boolean', example: true },
                  image: { type: 'string', example: 'ghcr.io/refty-yapi/refty-node/refty-node' },
                  version: { type: 'string', example: '05-06-42a252' },
                  timestamp: { type: 'string', example: '2025-07-15T06:25:05.577Z' },
                  details: {
                    type: 'object',
                    properties: {
                      filesChanged: { type: 'number', example: 3 },
                      filePaths: { 
                        type: 'array', 
                        items: { type: 'string' },
                        example: ['deployment.yaml', 'config.yaml', 'test.yaml']
                      },
                      changes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            file: { type: 'string', example: 'deployment.yaml' },
                            oldVersion: { type: 'string', example: '05-06-42a251' },
                            newVersion: { type: 'string', example: '05-06-42a252' }
                          }
                        },
                        example: [
                          {
                            file: 'deployment.yaml',
                            oldVersion: '05-06-42a251',
                            newVersion: '05-06-42a252'
                          }
                        ]
                      },
                      commitSha: { type: 'string', example: 'abc123def456' }
                    }
                  }
                },
                required: ['success', 'image', 'version', 'timestamp', 'details']
              }
            ]
          },
          examples: {
            'success-without-details': {
              summary: 'Successful response without details',
              description: 'Default response when details parameter is not set or set to false',
              value: {
                success: true,
                image: 'ghcr.io/refty-yapi/refty-node/refty-node',
                version: '05-06-42a252',
                timestamp: '2025-07-15T06:25:05.577Z'
              }
            },
            'success-with-details': {
              summary: 'Successful response with details',
              description: 'Response when details=true query parameter is set',
              value: {
                success: true,
                image: 'ghcr.io/refty-yapi/refty-node/refty-node',
                version: '05-06-42a252',
                timestamp: '2025-07-15T06:25:05.577Z',
                details: {
                  filesChanged: 3,
                  filePaths: ['deployment.yaml', 'config.yaml', 'test.yaml'],
                  changes: [
                    {
                      file: 'deployment.yaml',
                      oldVersion: '05-06-42a251',
                      newVersion: '05-06-42a252'
                    }
                  ],
                  commitSha: 'abc123def456'
                }
              }
            }
          }
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