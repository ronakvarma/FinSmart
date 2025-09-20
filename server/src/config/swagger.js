/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FinSmart API',
      version: '1.0.0',
      description: 'Real-time Risk Management API for Financial Services',
      contact: {
        name: 'FinSmart Team',
        email: 'api@finsmart.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.finsmart.com/api/v1'
          : `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk session token'
        },
        ClerkAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Clerk session token'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user_123456789'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              example: 'John Doe'
            },
            role: {
              type: 'string',
              enum: ['trader', 'risk_manager', 'admin', 'compliance'],
              example: 'risk_manager'
            },
            avatar_url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com/avatar.jpg'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Portfolio: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'port_123456789'
            },
            name: {
              type: 'string',
              example: 'Tech Growth Portfolio'
            },
            client_id: {
              type: 'string',
              example: 'client_123456789'
            },
            client_name: {
              type: 'string',
              example: 'Apex Capital'
            },
            total_value: {
              type: 'number',
              format: 'float',
              example: 12500000.00
            },
            var_1d: {
              type: 'number',
              format: 'float',
              example: -187500.00
            },
            pnl_today: {
              type: 'number',
              format: 'float',
              example: 125000.00
            },
            margin_utilization: {
              type: 'number',
              format: 'float',
              minimum: 0,
              maximum: 1,
              example: 0.65
            },
            risk_level: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'alert_123456789'
            },
            type: {
              type: 'string',
              enum: ['var_breach', 'concentration_risk', 'margin_call', 'suspicious_trade'],
              example: 'var_breach'
            },
            title: {
              type: 'string',
              example: 'VaR Limit Breach'
            },
            description: {
              type: 'string',
              example: '1-day VaR (-$187,500) exceeds limit (-$150,000)'
            },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high'
            },
            status: {
              type: 'string',
              enum: ['active', 'acknowledged', 'resolved'],
              example: 'active'
            },
            portfolio_id: {
              type: 'string',
              example: 'port_123456789'
            },
            threshold_value: {
              type: 'number',
              format: 'float',
              example: -150000.00
            },
            current_value: {
              type: 'number',
              format: 'float',
              example: -187500.00
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Path to the API files
};

const specs = swaggerJsdoc(options);

module.exports = specs;