/**
 * User Management Routes
 * Handles user administration and management
 */

const express = require('express');
const { requireAuth, getUserFromAuth, requireAdmin } = require('../config/clerk');
const { validate, validateId, userSchemas, querySchemas } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User Management]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [trader, risk_manager, admin, compliance]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     $ref: '#/components/schemas/User'
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
 *       403:
 *         description: Access denied - Admin role required
 */
router.get('/', 
  requireAuth,
  requireAdmin,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page, limit, sort, order, role, search } = req.query;

    // Build query
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(from, to);

    const { data: users, error, count } = await query;

    if (error) {
      logger.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: users,
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
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.get('/:id', 
  requireAuth,
  requireAdmin,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      logger.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }

    res.json({
      success: true,
      data: user
    });
  })
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [trader, risk_manager, admin, compliance]
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.put('/:id', 
  requireAuth,
  requireAdmin,
  validateId(),
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = getUserFromAuth(req.auth);
    
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: user, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      logger.error('Error updating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    logger.info('User updated by admin', { 
      userId: id, 
      adminId: currentUser.id,
      updates 
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  })
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.delete('/:id', 
  requireAuth,
  requireAdmin,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = getUserFromAuth(req.auth);

    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }

    logger.info('User deleted by admin', { 
      deletedUserId: id, 
      adminId: currentUser.id 
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
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
 *                     total_users:
 *                       type: integer
 *                     by_role:
 *                       type: object
 *                     recent_registrations:
 *                       type: integer
 *                     active_users:
 *                       type: integer
 */
router.get('/stats', 
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      // Get total user count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get user count by role
      const { data: users } = await supabase
        .from('profiles')
        .select('role');

      const roleDistribution = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentRegistrations } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      res.json({
        success: true,
        data: {
          total_users: totalUsers || 0,
          by_role: roleDistribution,
          recent_registrations: recentRegistrations || 0,
          active_users: totalUsers || 0 // Simplified - in real app, track last login
        }
      });
    } catch (error) {
      logger.error('Error fetching user statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  })
);

/**
 * @swagger
 * /users/{id}/activity:
 *   get:
 *     summary: Get user activity log (Admin only)
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of activity records to return
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 */
router.get('/:id/activity', 
  requireAuth,
  requireAdmin,
  validateId(),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    // First check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('id', id)
      .single();

    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      logger.error('Error checking user:', userError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity'
      });
    }

    // Get user activity from various tables
    const activities = [];

    try {
      // Get portfolio activities
      const { data: portfolioActivities } = await supabase
        .from('portfolios')
        .select('id, name, created_at, updated_at')
        .eq('user_id', id)
        .order('updated_at', { ascending: false })
        .limit(limit);

      portfolioActivities?.forEach(portfolio => {
        activities.push({
          type: 'portfolio_created',
          description: `Created portfolio: ${portfolio.name}`,
          timestamp: portfolio.created_at,
          metadata: { portfolio_id: portfolio.id }
        });
      });

      // Get alert activities
      const { data: alertActivities } = await supabase
        .from('alerts')
        .select('id, title, created_at, status')
        .eq('created_by', id)
        .order('created_at', { ascending: false })
        .limit(limit);

      alertActivities?.forEach(alert => {
        activities.push({
          type: 'alert_created',
          description: `Created alert: ${alert.title}`,
          timestamp: alert.created_at,
          metadata: { alert_id: alert.id, status: alert.status }
        });
      });

      // Sort all activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          },
          activities: activities.slice(0, limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching user activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user activity'
      });
    }
  })
);

module.exports = router;