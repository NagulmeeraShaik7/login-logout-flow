// swagger.config.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger configuration
 *
 * This file sets up OpenAPI 3.0 docs using swagger-jsdoc.
 * It pulls JSDoc @swagger comments from your routes/controllers.
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'Session-based authentication API with SQLite + Express',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Local dev server',
      },
      {
        url: process.env.PRODUCTION_URL || 'https://login-logout-flow-backend.onrender.com',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: process.env.SESSION_NAME || 'sid',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'test@example.com' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Something went wrong' },
              },
            },
          },
        },
      },
    },
  },
  // Globs to files containing @swagger JSDoc comments
  apis: ['./src/apps/**/routes/*.js', './src/apps/**/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Function to setup Swagger UI
 * @param {import('express').Express} app - Express app
 */
export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📚 Swagger docs available at /api-docs');
}

export default swaggerSpec;
