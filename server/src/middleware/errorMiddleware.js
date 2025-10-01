/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * Not Found middleware
 * Handles 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Error Handler middleware
 * Centralized error handling with proper logging and response formatting
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Log error details
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.userId || 'anonymous'
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    message = 'Database operation failed';
    statusCode = 400;
  }

  // Rate limiting errors
  if (err.status === 429) {
    message = 'Too many requests, please try again later';
    statusCode = 429;
  }

  // Clerk authentication errors
  if (err.status === 401 && err.message.includes('clerk')) {
    message = 'Authentication failed';
    statusCode = 401;
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    message = 'Validation failed';
    statusCode = 400;
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors.map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      })),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Response format
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.name 
    })
  };

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle unhandled promise rejections
 */
if (process.env.NODE_ENV !== 'test') {
  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection:', err);
    // In production, you might want to exit, but for development we'll just log
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });

  /**
   * Handle uncaught exceptions
   */
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError
};