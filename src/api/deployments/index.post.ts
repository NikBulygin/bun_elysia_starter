import { t } from 'elysia';
import { DeploymentRequest, DeploymentResponse, DeploymentHandler, SwaggerConfig } from '../../types/deployments';

// Handler function
export default ({ body }: { body: DeploymentRequest }): DeploymentResponse => {
  return {
    success: true,
    image: body.image,
    version: body.version,
    timestamp: new Date().toISOString()
  };
};

// Swagger metadata
export const swaggerConfig: SwaggerConfig = {
  tags: ['Deployments'],
  summary: 'Deploy Docker image',
  description: 'Deploy a Docker image with specified version',
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
            timestamp: t.String()
          })
        }
      }
    }
  }
}; 