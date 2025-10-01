/**
 * FinSmart Backend Server
 * Main server entry point with Express.js configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import middleware and routes
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { requestLogger } = require('./middleware/loggingMiddleware');
const { initializeDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const alertRoutes = require('./routes/alertRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const riskRoutes = require('./routes/riskRoutes');
const userRoutes = require('./routes/userRoutes');

// Import API documentation
const swaggerUi = require('swagger-ui-express');
let swaggerSpec;
try {
  swaggerSpec = require('./config/swagger');
} catch (error) {
  console.warn('Swagger configuration not available:', error.message);
  swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'FinSmart API',
      version: '1.0.0',
      description: 'Real-time Risk Management API'
    },
    paths: {}
  };
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FinSmart API Documentation'
}));

// API Routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/portfolios`, portfolioRoutes);
app.use(`${API_PREFIX}/alerts`, alertRoutes);
app.use(`${API_PREFIX}/trades`, tradeRoutes);
app.use(`${API_PREFIX}/risk`, riskRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FinSmart API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize database and start server
if (process.env.NODE_ENV !== 'test') {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 FinSmart API Server running on port ${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`💾 Database: Supabase integration active`);
    });
  });
}

module.exports = app;