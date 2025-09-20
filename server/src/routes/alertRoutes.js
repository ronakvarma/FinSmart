/**
 * Alert Routes
 * Handles alert CRUD operations and management
 */

const express = require('express');
const { requireAuth, getUserFromAuth, requireRiskManager } = require('../config/clerk');
const { validate, validateId, alertSchemas, querySchemas } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [var_breach, concentration_risk, margin_call, suspicious_trade]
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, acknowledged, resolved]
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
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
 *                     $ref: '#/components/schemas/Alert'
 */
router.get('/', 
  requireAuth,
  validate(querySchemas.pagination, 'query'),
  validate(querySchemas.alertFilters, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, sort, order } = req.query;
    const filters = req.query;

    // Build query
    let query = supabase
      .from('alerts')
      .select(`
        *,
        portfolios:portfolio_id (
          name,
          client_name
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.type) {
      query = query.eq('type', filters.type);
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

    const { data: alerts, error, count } = await query;

    if (error) {
      logger.error('Error fetching alerts:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch alerts'
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: alerts,
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
 * /alerts/{id}:
 *   get:
 *     summary: Get alert by ID
 *     tags: [Alerts]
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
 *         description: Alert retrieved successfully
 *       404:
 *         description: Alert not found
 */
router.get('/:id', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: alert, error } = await supabase
      .from('alerts')
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
          message: 'Alert not found'
        });
      }
      
      logger.error('Error fetching alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch alert'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  })
);

/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - description
 *               - severity
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [var_breach, concentration_risk, margin_call, suspicious_trade]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *               portfolio_id:
 *                 type: string
 *               threshold_value:
 *                 type: number
 *               current_value:
 *                 type: number
 *     responses:
 *       201:
 *         description: Alert created successfully
 */
router.post('/', 
  requireAuth,
  requireRiskManager,
  validate(alertSchemas.create),
  asyncHandler(async (req, res) => {
    const user = getUserFromAuth(req.auth);
    const alertData = {
      ...req.body,
      status: 'active',
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: alert, error } = await supabase
      .from('alerts')
      .insert([alertData])
      .select()
      .single();

    if (error) {
      logger.error('Error creating alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create alert'
      });
    }

    logger.info('Alert created', { alertId: alert.id, userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  })
);

/**
 * @swagger
 * /alerts/{id}:
 *   put:
 *     summary: Update alert
 *     tags: [Alerts]
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
 *                 enum: [active, acknowledged, resolved]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 */
router.put('/:id', 
  requireAuth,
  validateId(),
  validate(alertSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = getUserFromAuth(req.auth);
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: alert, error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      logger.error('Error updating alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update alert'
      });
    }

    logger.info('Alert updated', { alertId: id, userId: user.id });

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  })
);

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: Delete alert
 *     tags: [Alerts]
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
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 */
router.delete('/:id', 
  requireAuth,
  requireRiskManager,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete alert'
      });
    }

    logger.info('Alert deleted', { alertId: id });

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  })
);

/**
 * @swagger
 * /alerts/{id}/acknowledge:
 *   patch:
 *     summary: Acknowledge alert
 *     tags: [Alerts]
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
 *         description: Alert acknowledged successfully
 *       404:
 *         description: Alert not found
 */
router.patch('/:id/acknowledge', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = getUserFromAuth(req.auth);

    const { data: alert, error } = await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: user.id,
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      logger.error('Error acknowledging alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to acknowledge alert'
      });
    }

    logger.info('Alert acknowledged', { alertId: id, userId: user.id });

    res.json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  })
);

/**
 * @swagger
 * /alerts/{id}/resolve:
 *   patch:
 *     summary: Resolve alert
 *     tags: [Alerts]
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
 *         description: Alert resolved successfully
 *       404:
 *         description: Alert not found
 */
router.patch('/:id/resolve', 
  requireAuth,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const user = getUserFromAuth(req.auth);

    const { data: alert, error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }
      
      logger.error('Error resolving alert:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve alert'
      });
    }

    logger.info('Alert resolved', { alertId: id, userId: user.id });

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  })
);

module.exports = router;