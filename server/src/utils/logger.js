/**
 * Logger Configuration
 * Winston-based logging system with multiple transports
 */

const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += '\n' + JSON.stringify(meta, null, 2);
    }
    
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'finsmart-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Add console transport for production with limited output
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple()
    ),
    level: 'warn'
  }));
}

/**
 * Log performance metrics
 */
const logPerformance = (operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...metadata
  });
};

/**
 * Log security events
 */
const logSecurity = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log database operations
 */
const logDatabase = (operation, table, details = {}) => {
  logger.debug('Database operation', {
    operation,
    table,
    ...details
  });
};

/**
 * Log API requests (for debugging)
 */
const logRequest = (req, res, duration) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.userId || 'anonymous'
  };

  if (res.statusCode >= 400) {
    logger.error('Request failed', logData);
  } else if (duration > 1000) {
    logger.warn('Slow request', logData);
  } else {
    logger.info('Request completed', logData);
  }
};

module.exports = {
  logger,
  logPerformance,
  logSecurity,
  logDatabase,
  logRequest
};

// Export default logger
module.exports = logger;