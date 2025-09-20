/**
 * Suspicious Trade Routes
 * Handles suspicious trade detection and management
 */

const express = require('express');
const { requireAuth, getUserFromAuth, requireRiskManager } = require('../config/clerk');
const { validate, validateId, tradeSchemas, querySchemas } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /trades/suspicious:
 *   get:
 *     summary: Get all suspicious trades
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: trade_type
 *         schema:
 *           type: string
 *           enum: [wash_trade, off_market_price, volume_spike, unusual_pattern]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [new, investigating, resolved, false_positive]
 *     responses:
 *       200:
 *         description: Suspicious trades retrieved successfully
 */
router.get('/suspicious', 
  requireAuth,
  validate(querySchemas.pagination, 'query'),
  validate(querySchemas.tradeFilters, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, sort, order } = req.query;
    const filters = req.query;

    // Build query
    let query = supabase
      .from('suspicious_trades')
      .select(`
        *,
        portfolios:portfolio_id (
          name,
          client_name
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.trade_type) {
      query = query.eq('trade_type', filters.trade_type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.portfolio_id) {
      query = query.eq('portfolio_id', filters.portfolio_id);
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(from, to);

    const { data: trades, error, count } = await query;

    if (error) {
      logger.error('Error fetching suspicious trades:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch suspicious trades'
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: trades,
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
 * /trades/suspicious/{id}:
 *   get:
 *     summary: Get suspicious trade by ID
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suspicious trade retrieved successfully
 *       404:
 *         description: Trade not found
 */
router.get('/suspicious/:id', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: trade, error } = await supabase
      .from('suspicious_trades')
      .select(`
        *,
        portfolios:portfolio_id (
          name,
          client_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Suspicious trade not found'
        });
      }
      
      logger.error('Error fetching suspicious trade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch suspicious trade'
      });
    }

    res.json({
      success: true,
      data: trade
    });
  })
);

/**
 * @swagger
 * /trades/suspicious:
 *   post:
 *     summary: Report a suspicious trade
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - portfolio_id
 *               - symbol
 *               - trade_type
 *               - severity
 *               - amount
 *               - description
 *             properties:
 *               portfolio_id:
 *                 type: string
 *               symbol:
 *                 type: string
 *               trade_type:
 *                 type: string
 *                 enum: [wash_trade, off_market_price, volume_spike, unusual_pattern]
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Suspicious trade reported successfully
 */
router.post('/suspicious', 
  requireAuth,
  requireRiskManager,
  validate(tradeSchemas.create),
  asyncHandler(async (req, res) => {
    const user = getUserFromAuth(req.auth);
    
    // Get portfolio name for the trade
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolios')
      .select('name')
      .eq('id', req.body.portfolio_id)
      .single();

    if (portfolioError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid portfolio ID'
      });
    }

    const tradeData = {
      ...req.body,
      portfolio_name: portfolio.name,
      status: 'new',
      reported_by: user.id,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: trade, error } = await supabase
      .from('suspicious_trades')
      .insert([tradeData])
      .select()
      .single();

    if (error) {
      logger.error('Error reporting suspicious trade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to report suspicious trade'
      });
    }

    logger.info('Suspicious trade reported', { tradeId: trade.id, userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Suspicious trade reported successfully',
      data: trade
    });
  })
);

/**
 * @swagger
 * /trades/suspicious/{id}:
 *   put:
 *     summary: Update suspicious trade
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [new, investigating, resolved, false_positive]
 *               assigned_to:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trade updated successfully
 *       404:
 *         description: Trade not found
 */
router.put('/suspicious/:id', 
  requireAuth,
  requireRiskManager,
  validateId(),
  validate(tradeSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = getUserFromAuth(req.auth);
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: trade, error } = await supabase
      .from('suspicious_trades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Suspicious trade not found'
        });
      }
      
      logger.error('Error updating suspicious trade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update suspicious trade'
      });
    }

    logger.info('Suspicious trade updated', { tradeId: id, userId: user.id });

    res.json({
      success: true,
      message: 'Suspicious trade updated successfully',
      data: trade
    });
  })
);

/**
 * @swagger
 * /trades/suspicious/{id}/assign:
 *   patch:
 *     summary: Assign suspicious trade to investigator
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigned_to
 *             properties:
 *               assigned_to:
 *                 type: string
 *                 description: Email of the investigator
 *     responses:
 *       200:
 *         description: Trade assigned successfully
 *       404:
 *         description: Trade not found
 */
router.patch('/suspicious/:id/assign', 
  requireAuth,
  requireRiskManager,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { assigned_to } = req.body;
    const user = getUserFromAuth(req.auth);

    if (!assigned_to) {
      return res.status(400).json({
        success: false,
        message: 'assigned_to is required'
      });
    }

    const { data: trade, error } = await supabase
      .from('suspicious_trades')
      .update({
        assigned_to,
        status: 'investigating',
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Suspicious trade not found'
        });
      }
      
      logger.error('Error assigning suspicious trade:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to assign suspicious trade'
      });
    }

    logger.info('Suspicious trade assigned', { 
      tradeId: id, 
      assignedTo: assigned_to, 
      assignedBy: user.id 
    });

    res.json({
      success: true,
      message: 'Suspicious trade assigned successfully',
      data: trade
    });
  })
);

/**
 * @swagger
 * /trades/suspicious/stats:
 *   get:
 *     summary: Get suspicious trade statistics
 *     tags: [Suspicious Trades]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *                     by_severity:
 *                       type: object
 *                     by_type:
 *                       type: object
 */
router.get('/suspicious/stats', 
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      // Get total count
      const { count: total } = await supabase
        .from('suspicious_trades')
        .select('*', { count: 'exact', head: true });

      // Get counts by status
      const { data: statusCounts } = await supabase
        .from('suspicious_trades')
        .select('status')
        .then(({ data }) => {
          const counts = {};
          data?.forEach(trade => {
            counts[trade.status] = (counts[trade.status] || 0) + 1;
          });
          return { data: counts };
        });

      // Get counts by severity
      const { data: severityCounts } = await supabase
        .from('suspicious_trades')
        .select('severity')
        .then(({ data }) => {
          const counts = {};
          data?.forEach(trade => {
            counts[trade.severity] = (counts[trade.severity] || 0) + 1;
          });
          return { data: counts };
        });

      // Get counts by type
      const { data: typeCounts } = await supabase
        .from('suspicious_trades')
        .select('trade_type')
        .then(({ data }) => {
          const counts = {};
          data?.forEach(trade => {
            counts[trade.trade_type] = (counts[trade.trade_type] || 0) + 1;
          });
          return { data: counts };
        });

      res.json({
        success: true,
        data: {
          total: total || 0,
          by_status: statusCounts || {},
          by_severity: severityCounts || {},
          by_type: typeCounts || {}
        }
      });
    } catch (error) {
      logger.error('Error fetching suspicious trade stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics'
      });
    }
  })
);

module.exports = router;