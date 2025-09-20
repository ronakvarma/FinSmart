/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

const { supabase } = require('../src/config/database');
const logger = require('../src/utils/logger');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Global test timeout
jest.setTimeout(10000);

// Mock Clerk authentication for tests
jest.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressRequireAuth: () => (req, res, next) => {
    req.auth = {
      userId: 'test_user_123',
      sessionId: 'test_session_123'
    };
    next();
  },
  ClerkExpressWithAuth: () => (req, res, next) => {
    req.auth = {
      userId: 'test_user_123',
      sessionId: 'test_session_123'
    };
    next();
  }
}));

// Global test utilities
global.testUtils = {
  // Create test user
  createTestUser: async (userData = {}) => {
    const defaultUser = {
      id: 'test_user_' + Date.now(),
      email: 'test@example.com',
      name: 'Test User',
      role: 'trader',
      ...userData
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([defaultUser])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create test portfolio
  createTestPortfolio: async (portfolioData = {}) => {
    const defaultPortfolio = {
      id: 'test_port_' + Date.now(),
      name: 'Test Portfolio',
      client_id: 'test_client_001',
      client_name: 'Test Client',
      total_value: 1000000.00,
      var_1d: -15000.00,
      pnl_today: 5000.00,
      margin_utilization: 0.5,
      risk_level: 'medium',
      user_id: 'test_user_123',
      ...portfolioData
    };

    const { data, error } = await supabase
      .from('portfolios')
      .insert([defaultPortfolio])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Clean up test data
  cleanupTestData: async () => {
    const tables = ['risk_metrics', 'suspicious_trades', 'alerts', 'holdings', 'portfolios', 'profiles'];
    
    for (const table of tables) {
      await supabase
        .from(table)
        .delete()
        .like('id', 'test_%');
    }
  },

  // Mock request object
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    auth: {
      userId: 'test_user_123',
      sessionId: 'test_session_123'
    },
    ...overrides
  }),

  // Mock response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Setup and teardown
beforeAll(async () => {
  // Ensure test database is clean
  await global.testUtils.cleanupTestData();
});

afterAll(async () => {
  // Clean up after all tests
  await global.testUtils.cleanupTestData();
});

afterEach(async () => {
  // Clean up after each test
  await global.testUtils.cleanupTestData();
});

// Suppress console logs during tests unless LOG_LEVEL is debug
if (process.env.LOG_LEVEL !== 'debug') {
  console.log = jest.fn();
  console.info = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}