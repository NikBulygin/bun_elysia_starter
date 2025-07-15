// Request types
export interface DeploymentRequest {
  image: string;
  version: string;
}

// Response types
export interface DeploymentResponse {
  success: boolean;
  image: string;
  version: string;
  timestamp: string;
}

// Handler function type
export type DeploymentHandler = (params: { body: DeploymentRequest }) => DeploymentResponse;

// Swagger configuration type
export interface SwaggerConfig {
  tags: string[];
  summary: string;
  description: string;
  body: any;
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: string;
          properties: Record<string, any>;
          required: string[];
        };
        examples: Record<string, {
          summary: string;
          value: DeploymentRequest;
        }>;
      };
    };
  };
  responses: Record<string, any>;
} 