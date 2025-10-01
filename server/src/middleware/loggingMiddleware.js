/**
 * Logging Middleware
 * Request/Response logging and monitoring
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Request logging middleware
 * Adds request ID and logs request details
 */
const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.requestId = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);
  
  // Log request start
  const startTime = Date.now();
  
  console.log('Request started', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.userId || 'anonymous'
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log('Request completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.auth?.userId || 'anonymous'
    });
    
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Security logging middleware
 * Logs security-related events
 */
const securityLogger = (event, details = {}) => {
  console.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Performance monitoring middleware
 * Logs slow requests
 */
const performanceLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        console.warn('Slow request detected', {
          requestId: req.requestId,
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          userId: req.auth?.userId || 'anonymous'
        });
      }
    });
    
    next();
  };
};

/**
 * Database operation logger
 */
const dbLogger = (operation, table, details = {}) => {
  console.log('Database operation', {
    operation,
    table,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Authentication event logger
 */
const authLogger = (event, userId, details = {}) => {
  console.log('Authentication event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = {
  requestLogger,
  securityLogger,
  performanceLogger,
  dbLogger,
  authLogger
};