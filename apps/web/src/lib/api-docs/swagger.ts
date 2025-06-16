/**
 * Swagger/OpenAPI Documentation Setup
 * Generates API documentation for the application
 */

import swaggerJSDoc from 'swagger-jsdoc';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Starter Template API',
    version: '1.0.0',
    description: 'API documentation for the Starter Template application',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com'
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' 
        ? 'Production server'
        : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User unique identifier',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          full_name: {
            type: 'string',
            description: 'User full name',
          },
          avatar_url: {
            type: 'string',
            format: 'uri',
            description: 'User avatar image URL',
          },
          bio: {
            type: 'string',
            description: 'User biography',
          },
          location: {
            type: 'string',
            description: 'User location',
          },
          website: {
            type: 'string',
            format: 'uri',
            description: 'User website URL',
          },
          preferences: {
            type: 'object',
            description: 'User preferences and settings',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
          },
        },
      },
      UserProfile: {
        allOf: [
          { $ref: '#/components/schemas/User' },
          {
            type: 'object',
            properties: {
              user_id: {
                type: 'string',
                format: 'uuid',
                description: 'Reference to the user ID',
              },
            },
          },
        ],
      },
      ApiResponse: {
        type: 'object',
        properties: {
          data: {
            description: 'Response data',
          },
          message: {
            type: 'string',
            description: 'Response message',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Response timestamp',
          },
        },
      },
      PaginatedResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Current page number',
                  },
                  limit: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    description: 'Number of items per page',
                  },
                  total: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Total number of items',
                  },
                  totalPages: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Total number of pages',
                  },
                  hasNextPage: {
                    type: 'boolean',
                    description: 'Whether there is a next page',
                  },
                  hasPreviousPage: {
                    type: 'boolean',
                    description: 'Whether there is a previous page',
                  },
                },
              },
            },
          },
        ],
      },
      ApiError: {
        type: 'object',
        required: ['code', 'message', 'timestamp'],
        properties: {
          code: {
            type: 'string',
            description: 'Error code',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          details: {
            type: 'object',
            description: 'Additional error details',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Error timestamp',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              code: 'UNAUTHORIZED',
              message: 'Authentication required',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
      ValidationError: {
        description: 'Input validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              code: 'VALIDATION_ERROR',
              message: 'Input validation failed',
              details: {
                field: 'email',
                error: 'Invalid email format',
              },
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              code: 'INTERNAL_ERROR',
              message: 'An unexpected error occurred',
              timestamp: '2023-01-01T00:00:00Z',
            },
          },
        },
      },
    },
    parameters: {
      PageQuery: {
        name: 'page',
        in: 'query',
        description: 'Page number for pagination',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
      },
      LimitQuery: {
        name: 'limit',
        in: 'query',
        description: 'Number of items per page',
        required: false,
        schema: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
        },
      },
      SearchQuery: {
        name: 'search',
        in: 'query',
        description: 'Search query string',
        required: false,
        schema: {
          type: 'string',
          minLength: 1,
        },
      },
      SortFieldQuery: {
        name: 'sort_field',
        in: 'query',
        description: 'Field to sort by',
        required: false,
        schema: {
          type: 'string',
        },
      },
      SortDirectionQuery: {
        name: 'sort_direction',
        in: 'query',
        description: 'Sort direction',
        required: false,
        schema: {
          type: 'string',
          enum: ['asc', 'desc'],
          default: 'desc',
        },
      },
      UserIdPath: {
        name: 'userId',
        in: 'path',
        description: 'User ID',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Profiles',
      description: 'User profile management endpoints',
    },
  ],
};

// Options for swagger-jsdoc
const options = {
  definition: swaggerDefinition,
  apis: [
    './pages/api/**/*.ts', // Include API routes
    './src/lib/trpc/routers/**/*.ts', // Include tRPC routers
  ],
};

// Generate swagger spec
export const swaggerSpec = swaggerJSDoc(options);

// Export the swagger definition for use in other files
export { swaggerDefinition };

// Helper function to generate OpenAPI documentation from tRPC router
export function generateOpenAPIFromTRPC() {
  // This would require additional setup with @trpc/openapi
  // For now, we'll use manual documentation
  return swaggerSpec;
}