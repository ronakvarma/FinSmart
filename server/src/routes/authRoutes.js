/**
 * Authentication Routes
 * Handles user authentication, registration, and profile management
 */

const express = require('express');
const { requireAuth, withAuth, getUserFromAuth } = require('../config/clerk');
const { validate } = require('../middleware/validationMiddleware');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { supabase } = require('../config/database');

// Simple validation schemas
const userSchemas = {
  updateProfile: {
    validate: (data) => {
      const errors = [];
      if (data.name && (typeof data.name !== 'string' || data.name.length < 2)) {
        errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
      }
      if (data.role && !['trader', 'risk_manager', 'admin', 'compliance'].includes(data.role)) {
        errors.push({ field: 'role', message: 'Invalid role' });
      }
      return { errors, isValid: errors.length === 0 };
    }
  }
};

// Simple validation middleware
const validateProfile = (req, res, next) => {
  const { errors, isValid } = userSchemas.updateProfile.validate(req.body);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  next();
};

const router = express.Router();

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', requireAuth, asyncHandler(async (req, res) => {
  const user = getUserFromAuth(req.auth);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Get user profile from database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }

  // If profile doesn't exist, create a basic one
  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: req.auth.sessionClaims?.email || '',
        name: req.auth.sessionClaims?.firstName + ' ' + req.auth.sessionClaims?.lastName || 'User',
        role: 'trader',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user profile:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user profile'
      });
    }

    return res.json({
      success: true,
      data: newProfile
    });
  }

  res.json({
    success: true,
    data: profile
  });
}));

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               role:
 *                 type: string
 *                 enum: [trader, risk_manager, admin, compliance]
 *                 example: "risk_manager"
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', 
  requireAuth, 
  validateProfile,
  asyncHandler(async (req, res) => {
    const user = getUserFromAuth(req.auth);
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    console.log('User profile updated', { userId: user.id, updates });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  })
);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (webhook endpoint for Clerk)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   email_addresses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         email_address:
 *                           type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Registration failed
 */
router.post('/register', asyncHandler(async (req, res) => {
  // This endpoint is typically called by Clerk webhooks
  const { data } = req.body;
  
  if (!data || !data.id) {
    return res.status(400).json({
      success: false,
      message: 'Invalid registration data'
    });
  }

  const email = data.email_addresses?.[0]?.email_address || '';
  const firstName = data.first_name || '';
  const lastName = data.last_name || '';
  const name = `${firstName} ${lastName}`.trim() || 'User';

  // Create user profile in database
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert([{
      id: data.id,
      email,
      name,
      role: 'trader', // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile during registration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user profile'
    });
  }

  console.log('New user registered', { userId: data.id, email });

  res.json({
    success: true,
    message: 'User registered successfully',
    data: profile
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login (handled by Clerk)
 *     tags: [Authentication]
 *     description: This endpoint is handled by Clerk. Use Clerk's authentication flow.
 *     responses:
 *       200:
 *         description: Login handled by Clerk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login is handled by Clerk authentication service"
 */
router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login is handled by Clerk authentication service',
    redirectTo: 'https://clerk.com/docs/authentication'
  });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout (handled by Clerk)
 *     tags: [Authentication]
 *     description: This endpoint is handled by Clerk. Use Clerk's authentication flow.
 *     responses:
 *       200:
 *         description: Logout handled by Clerk
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout is handled by Clerk authentication service'
  });
});

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Password reset (handled by Clerk)
 *     tags: [Authentication]
 *     description: This endpoint is handled by Clerk. Use Clerk's password reset flow.
 *     responses:
 *       200:
 *         description: Password reset handled by Clerk
 */
router.post('/forgot-password', (req, res) => {
  res.json({
    success: true,
    message: 'Password reset is handled by Clerk authentication service'
  });
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify authentication status
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Authentication verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sessionId:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
router.get('/verify', withAuth, (req, res) => {
  const user = getUserFromAuth(req.auth);
  
  res.json({
    success: true,
    authenticated: !!user,
    user: user || null
  });
});

module.exports = router;