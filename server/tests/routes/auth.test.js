/**
 * Authentication Routes Tests
 * Test suite for auth endpoints
 */

const request = require('supertest');
const app = require('../../src/server');

describe('Authentication Routes', () => {
  describe('GET /api/v1/auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Create test user first
      const testUser = await global.testUtils.createTestUser({
        id: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'trader'
      });

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'trader'
      });
    });

    it('should create profile if it does not exist', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('name');
    });
  });

  describe('PUT /api/v1/auth/profile', () => {
    beforeEach(async () => {
      await global.testUtils.createTestUser({
        id: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'trader'
      });
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Test User',
        role: 'risk_manager'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Test User');
      expect(response.body.data.role).toBe('risk_manager');
    });

    it('should validate input data', async () => {
      const invalidData = {
        name: 'A', // Too short
        role: 'invalid_role'
      };

      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toHaveLength(2);
    });

    it('should reject empty update', async () => {
      const response = await request(app)
        .put('/api/v1/auth/profile')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/auth/verify', () => {
    it('should verify authentication status', async () => {
      const response = await request(app)
        .get('/api/v1/auth/verify')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authenticated).toBe(true);
      expect(response.body.user).toMatchObject({
        id: 'test_user_123',
        sessionId: 'test_session_123'
      });
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should handle user registration webhook', async () => {
      const webhookData = {
        data: {
          id: 'user_new_123',
          email_addresses: [{ email_address: 'newuser@example.com' }],
          first_name: 'New',
          last_name: 'User'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toMatchObject({
        id: 'user_new_123',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'trader'
      });
    });

    it('should reject invalid registration data', async () => {
      const invalidData = {
        data: {
          // Missing required fields
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid registration data');
    });
  });

  describe('Authentication info endpoints', () => {
    it('should return login info', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Clerk');
    });

    it('should return logout info', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Clerk');
    });

    it('should return forgot password info', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Clerk');
    });
  });
});