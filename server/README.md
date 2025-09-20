# FinSmart Backend API

A comprehensive, production-ready backend system for real-time financial risk management. Built with Node.js, Express, Supabase, and Clerk authentication.

## 🚀 Features

- **Authentication & Authorization**: Clerk-based authentication with role-based access control
- **RESTful API**: Complete CRUD operations for portfolios, alerts, trades, and risk analysis
- **Real-time Risk Management**: Portfolio monitoring, VaR calculations, and concentration analysis
- **Suspicious Trade Detection**: Automated detection and investigation workflow
- **Comprehensive Security**: Rate limiting, input validation, CORS, and security headers
- **Production Ready**: Docker support, logging, monitoring, and error handling
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Testing Suite**: Comprehensive unit and integration tests

## 🛠 Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Supabase account and project
- Clerk account and application

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd server
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your actual values:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database (Supabase)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Database Setup

Run database migrations to create tables:

```bash
npm run migrate
```

Seed the database with sample data (optional):

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at:
- **API**: http://localhost:5000
- **Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register     # User registration (webhook)
POST   /api/v1/auth/login        # User login (handled by Clerk)
POST   /api/v1/auth/logout       # User logout (handled by Clerk)
GET    /api/v1/auth/profile      # Get user profile
PUT    /api/v1/auth/profile      # Update user profile
POST   /api/v1/auth/forgot-password # Password reset (handled by Clerk)
GET    /api/v1/auth/verify       # Verify authentication status
```

### Portfolio Management

```
GET    /api/v1/portfolios        # Get all portfolios
POST   /api/v1/portfolios        # Create new portfolio
GET    /api/v1/portfolios/:id    # Get portfolio by ID
PUT    /api/v1/portfolios/:id    # Update portfolio
DELETE /api/v1/portfolios/:id    # Delete portfolio
GET    /api/v1/portfolios/:id/holdings # Get portfolio holdings
```

### Alert Management

```
GET    /api/v1/alerts            # Get all alerts
POST   /api/v1/alerts            # Create new alert
GET    /api/v1/alerts/:id        # Get alert by ID
PUT    /api/v1/alerts/:id        # Update alert
DELETE /api/v1/alerts/:id        # Delete alert
PATCH  /api/v1/alerts/:id/acknowledge # Acknowledge alert
PATCH  /api/v1/alerts/:id/resolve     # Resolve alert
```

### Suspicious Trades

```
GET    /api/v1/trades/suspicious # Get suspicious trades
POST   /api/v1/trades/suspicious # Report suspicious trade
GET    /api/v1/trades/suspicious/:id # Get trade by ID
PUT    /api/v1/trades/suspicious/:id # Update trade
PATCH  /api/v1/trades/suspicious/:id/assign # Assign investigator
GET    /api/v1/trades/suspicious/stats # Get statistics
```

### Risk Analysis

```
GET    /api/v1/risk/metrics      # Get risk metrics
GET    /api/v1/risk/concentration # Get concentration analysis
GET    /api/v1/risk/var-analysis # Get VaR analysis
POST   /api/v1/risk/stress-test  # Perform stress test
GET    /api/v1/risk/dashboard    # Get risk dashboard
```

### User Management (Admin Only)

```
GET    /api/v1/users             # Get all users
GET    /api/v1/users/:id         # Get user by ID
PUT    /api/v1/users/:id         # Update user
DELETE /api/v1/users/:id         # Delete user
GET    /api/v1/users/stats       # Get user statistics
GET    /api/v1/users/:id/activity # Get user activity
```

## 🔒 Authentication & Authorization

The API uses Clerk for authentication with role-based access control:

### Roles

- **trader**: Basic access to view portfolios and alerts
- **risk_manager**: Can create/update portfolios, alerts, and trades
- **compliance**: Can manage suspicious trades and investigations
- **admin**: Full access to all resources and user management

### Authentication Flow

1. Users authenticate through Clerk (frontend)
2. Clerk provides JWT tokens for API access
3. API validates tokens and extracts user information
4. Role-based permissions are enforced on protected routes

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── setup.js              # Test configuration
├── routes/
│   ├── auth.test.js      # Authentication tests
│   ├── portfolios.test.js # Portfolio tests
│   └── ...
└── utils/
    └── testHelpers.js    # Test utilities
```

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Build

```bash
# Build production image
docker build -t finsmart-api .

# Run container
docker run -p 5000:5000 --env-file .env finsmart-api
```

## 📊 Monitoring & Logging

### Logging

The application uses Winston for structured logging:

- **Development**: Console output with colors
- **Production**: File-based logging with rotation
- **Log Levels**: error, warn, info, debug

Log files are stored in the `logs/` directory:
- `error.log`: Error-level logs only
- `combined.log`: All log levels
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

### Health Monitoring

Health check endpoint: `GET /health`

Returns system status, uptime, and version information.

### Performance Monitoring

- Request/response logging with duration
- Slow query detection (>1000ms)
- Memory and CPU usage tracking
- Rate limiting metrics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `LOG_LEVEL` | Logging level | info |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Database Configuration

The application uses Supabase with Row Level Security (RLS) enabled:

- **Profiles**: User information and roles
- **Portfolios**: Investment portfolio data
- **Holdings**: Individual portfolio positions
- **Alerts**: Risk and compliance alerts
- **Suspicious Trades**: Trade monitoring and investigation
- **Risk Metrics**: Historical risk calculations

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### Deployment Options

1. **Docker**: Use provided Dockerfile and docker-compose.yml
2. **Cloud Platforms**: Deploy to AWS, GCP, Azure, or Heroku
3. **Serverless**: Adapt for AWS Lambda or Vercel Functions
4. **Traditional**: Deploy to VPS or dedicated server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the API docs at `/api-docs`
- **Issues**: Create an issue on GitHub
- **Email**: support@finsmart.com

## 🔄 Changelog

### v1.0.0 (2024-01-15)

- Initial release
- Complete authentication system
- Portfolio management
- Risk analysis features
- Suspicious trade detection
- Comprehensive API documentation
- Docker support
- Test suite

---

**FinSmart Backend API** - Built with ❤️ for financial risk management