/**
 * Validation Middleware
 * Input validation using Joi schemas
 */

const Joi = require('joi');
const { AppError } = require('./errorMiddleware');

/**
 * Generic validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

/**
 * User validation schemas
 */
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    role: Joi.string().valid('trader', 'risk_manager', 'admin', 'compliance').default('trader')
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    role: Joi.string().valid('trader', 'risk_manager', 'admin', 'compliance'),
    avatar_url: Joi.string().uri().allow('')
  }).min(1)
};

/**
 * Portfolio validation schemas
 */
const portfolioSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    client_id: Joi.string().required(),
    client_name: Joi.string().min(2).max(100).required(),
    total_value: Joi.number().positive().required(),
    var_1d: Joi.number().required(),
    pnl_today: Joi.number().required(),
    margin_utilization: Joi.number().min(0).max(1).required(),
    risk_level: Joi.string().valid('low', 'medium', 'high').required()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    client_name: Joi.string().min(2).max(100),
    total_value: Joi.number().positive(),
    var_1d: Joi.number(),
    pnl_today: Joi.number(),
    margin_utilization: Joi.number().min(0).max(1),
    risk_level: Joi.string().valid('low', 'medium', 'high')
  }).min(1)
};

/**
 * Alert validation schemas
 */
const alertSchemas = {
  create: Joi.object({
    type: Joi.string().valid('var_breach', 'concentration_risk', 'margin_call', 'suspicious_trade').required(),
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    severity: Joi.string().valid('low', 'medium', 'high').required(),
    portfolio_id: Joi.string(),
    threshold_value: Joi.number(),
    current_value: Joi.number()
  }),

  update: Joi.object({
    status: Joi.string().valid('active', 'acknowledged', 'resolved'),
    title: Joi.string().min(5).max(200),
    description: Joi.string().min(10).max(1000),
    severity: Joi.string().valid('low', 'medium', 'high')
  }).min(1)
};

/**
 * Trade validation schemas
 */
const tradeSchemas = {
  create: Joi.object({
    portfolio_id: Joi.string().required(),
    symbol: Joi.string().min(1).max(10).required(),
    trade_type: Joi.string().valid('wash_trade', 'off_market_price', 'volume_spike', 'unusual_pattern').required(),
    severity: Joi.string().valid('low', 'medium', 'high').required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().min(10).max(1000).required()
  }),

  update: Joi.object({
    status: Joi.string().valid('new', 'investigating', 'resolved', 'false_positive'),
    assigned_to: Joi.string().email().allow(''),
    description: Joi.string().min(10).max(1000)
  }).min(1)
};

/**
 * Query parameter validation schemas
 */
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('created_at'),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  portfolioFilters: Joi.object({
    risk_level: Joi.string().valid('low', 'medium', 'high'),
    client_id: Joi.string(),
    min_value: Joi.number().positive(),
    max_value: Joi.number().positive()
  }).and('min_value', 'max_value'),

  alertFilters: Joi.object({
    type: Joi.string().valid('var_breach', 'concentration_risk', 'margin_call', 'suspicious_trade'),
    severity: Joi.string().valid('low', 'medium', 'high'),
    status: Joi.string().valid('active', 'acknowledged', 'resolved'),
    portfolio_id: Joi.string()
  }),

  tradeFilters: Joi.object({
    trade_type: Joi.string().valid('wash_trade', 'off_market_price', 'volume_spike', 'unusual_pattern'),
    severity: Joi.string().valid('low', 'medium', 'high'),
    status: Joi.string().valid('new', 'investigating', 'resolved', 'false_positive'),
    portfolio_id: Joi.string()
  })
};

/**
 * ID parameter validation
 */
const validateId = (paramName = 'id') => {
  return validate(
    Joi.object({
      [paramName]: Joi.string().required()
    }),
    'params'
  );
};

module.exports = {
  validate,
  validateId,
  userSchemas,
  portfolioSchemas,
  alertSchemas,
  tradeSchemas,
  querySchemas
};