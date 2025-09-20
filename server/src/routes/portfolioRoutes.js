/**
 * Portfolio Routes
 * Handles portfolio CRUD operations and management
 */

const express = require('express');
const { requireAuth, getUserFromAuth, requireRiskManager } = require('../config/clerk');
const { validate, validateId, portfolioSchemas, querySchemas } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /portfolios:
 *   get:
 *     summary: Get all portfolios
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: risk_level
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by risk level
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: Portfolios retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Portfolio'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 */
router.get('/', 
  requireAuth,
  validate(querySchemas.pagination, 'query'),
  validate(querySchemas.portfolioFilters, 'query'),
  asyncHandler(async (req, res) => {
    const user = getUserFromAuth(req.auth);
    const { page, limit, sort, order } = req.query;
    const filters = req.query;

    // Build query
    let query = supabase
      .from('portfolios')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.risk_level) {
      query = query.eq('risk_level', filters.risk_level);
    }
    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id);
    }
    if (filters.min_value) {
      query = query.gte('total_value', filters.min_value);
    }
    if (filters.max_value) {
      query = query.lte('total_value', filters.max_value);
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(from, to);

    const { data: portfolios, error, count } = await query;

    if (error) {
      logger.error('Error fetching portfolios:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolios'
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: portfolios,
      pagination: {
        page,
        limit,
        total: count,
        pages: totalPages
      }
    });
  })
);

/**
 * @swagger
 * /portfolios/{id}:
 *   get:
 *     summary: Get portfolio by ID
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 *       404:
 *         description: Portfolio not found
 */
router.get('/:id', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      logger.error('Error fetching portfolio:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio'
      });
    }

    res.json({
      success: true,
      data: portfolio
    });
  })
);

/**
 * @swagger
 * /portfolios:
 *   post:
 *     summary: Create a new portfolio
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - client_id
 *               - client_name
 *               - total_value
 *               - var_1d
 *               - pnl_today
 *               - margin_utilization
 *               - risk_level
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech Growth Portfolio"
 *               client_id:
 *                 type: string
 *                 example: "client_123456789"
 *               client_name:
 *                 type: string
 *                 example: "Apex Capital"
 *               total_value:
 *                 type: number
 *                 example: 12500000.00
 *               var_1d:
 *                 type: number
 *                 example: -187500.00
 *               pnl_today:
 *                 type: number
 *                 example: 125000.00
 *               margin_utilization:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.65
 *               risk_level:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "high"
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Portfolio'
 */
router.post('/', 
  requireAuth,
  requireRiskManager,
  validate(portfolioSchemas.create),
  asyncHandler(async (req, res) => {
    const user = getUserFromAuth(req.auth);
    const portfolioData = {
      ...req.body,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert([portfolioData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating portfolio:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create portfolio'
      });
    }

    logger.info('Portfolio created', { portfolioId: portfolio.id, userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  })
);

/**
 * @swagger
 * /portfolios/{id}:
 *   put:
 *     summary: Update portfolio
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               client_name:
 *                 type: string
 *               total_value:
 *                 type: number
 *               var_1d:
 *                 type: number
 *               pnl_today:
 *                 type: number
 *               margin_utilization:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               risk_level:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *       404:
 *         description: Portfolio not found
 */
router.put('/:id', 
  requireAuth,
  requireRiskManager,
  validateId(),
  validate(portfolioSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      logger.error('Error updating portfolio:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update portfolio'
      });
    }

    logger.info('Portfolio updated', { portfolioId: id });

    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  })
);

/**
 * @swagger
 * /portfolios/{id}:
 *   delete:
 *     summary: Delete portfolio
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
 *       404:
 *         description: Portfolio not found
 */
router.delete('/:id', 
  requireAuth,
  requireRiskManager,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting portfolio:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete portfolio'
      });
    }

    logger.info('Portfolio deleted', { portfolioId: id });

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  })
);

/**
 * @swagger
 * /portfolios/{id}/holdings:
 *   get:
 *     summary: Get portfolio holdings
 *     tags: [Portfolios]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *     responses:
 *       200:
 *         description: Holdings retrieved successfully
 *       404:
 *         description: Portfolio not found
 */
router.get('/:id/holdings', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // First check if portfolio exists
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', id)
      .single();

    if (portfolioError) {
      if (portfolioError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Portfolio not found'
        });
      }
      
      logger.error('Error checking portfolio:', portfolioError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio holdings'
      });
    }

    // Get holdings
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('portfolio_id', id)
      .order('weight_percent', { ascending: false });

    if (error) {
      logger.error('Error fetching holdings:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio holdings'
      });
    }

    res.json({
      success: true,
      data: holdings
    });
  })
);

module.exports = router;