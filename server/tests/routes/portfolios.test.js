/**
 * Portfolio Routes Tests
 * Test suite for portfolio endpoints
 */

const request = require('supertest');
const app = require('../../src/server');

describe('Portfolio Routes', () => {
  let testUser;
  let testPortfolio;

  beforeEach(async () => {
    // Create test user
    testUser = await global.testUtils.createTestUser({
      id: 'test_user_123',
      role: 'risk_manager'
    });

    // Create test portfolio
    testPortfolio = await global.testUtils.createTestPortfolio({
      user_id: testUser.id
    });
  });

  describe('GET /api/v1/portfolios', () => {
    it('should return all portfolios with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/portfolios')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        pages: expect.any(Number)
      });
    });

    it('should filter portfolios by risk level', async () => {
      const response = await request(app)
        .get('/api/v1/portfolios')
        .query({ risk_level: 'medium' })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(portfolio => {
        expect(portfolio.risk_level).toBe('medium');
      });
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/portfolios')
        .query({ page: 0, limit: 101 }) // Invalid values
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/portfolios/:id', () => {
    it('should return specific portfolio', async () => {
      const response = await request(app)
        .get(`/api/v1/portfolios/${testPortfolio.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testPortfolio.id,
        name: testPortfolio.name,
        client_name: testPortfolio.client_name
      });
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .get('/api/v1/portfolios/non_existent_id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Portfolio not found');
    });
  });

  describe('POST /api/v1/portfolios', () => {
    const validPortfolioData = {
      name: 'New Test Portfolio',
      client_id: 'client_new_001',
      client_name: 'New Test Client',
      total_value: 2000000.00,
      var_1d: -25000.00,
      pnl_today: 10000.00,
      margin_utilization: 0.6,
      risk_level: 'high'
    };

    it('should create new portfolio successfully', async () => {
      const response = await request(app)
        .post('/api/v1/portfolios')
        .send(validPortfolioData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Portfolio created successfully');
      expect(response.body.data).toMatchObject({
        name: validPortfolioData.name,
        client_name: validPortfolioData.client_name,
        total_value: validPortfolioData.total_value
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Test Portfolio'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/portfolios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate data types and ranges', async () => {
      const invalidData = {
        ...validPortfolioData,
        total_value: -1000, // Negative value
        margin_utilization: 1.5, // > 1
        risk_level: 'invalid' // Invalid enum
      };

      const response = await request(app)
        .post('/api/v1/portfolios')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/v1/portfolios/:id', () => {
    it('should update portfolio successfully', async () => {
      const updateData = {
        name: 'Updated Portfolio Name',
        risk_level: 'low'
      };

      const response = await request(app)
        .put(`/api/v1/portfolios/${testPortfolio.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.risk_level).toBe(updateData.risk_level);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .put('/api/v1/portfolios/non_existent_id')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Portfolio not found');
    });

    it('should validate update data', async () => {
      const invalidData = {
        margin_utilization: 2.0 // > 1
      };

      const response = await request(app)
        .put(`/api/v1/portfolios/${testPortfolio.id}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('DELETE /api/v1/portfolios/:id', () => {
    it('should delete portfolio successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/portfolios/${testPortfolio.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Portfolio deleted successfully');

      // Verify portfolio is deleted
      const getResponse = await request(app)
        .get(`/api/v1/portfolios/${testPortfolio.id}`)
        .expect(404);
    });

    it('should handle deletion of non-existent portfolio', async () => {
      const response = await request(app)
        .delete('/api/v1/portfolios/non_existent_id')
        .expect(200); // Supabase doesn't error on delete of non-existent record

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/portfolios/:id/holdings', () => {
    it('should return portfolio holdings', async () => {
      const response = await request(app)
        .get(`/api/v1/portfolios/${testPortfolio.id}/holdings`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent portfolio', async () => {
      const response = await request(app)
        .get('/api/v1/portfolios/non_existent_id/holdings')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Portfolio not found');
    });
  });
});