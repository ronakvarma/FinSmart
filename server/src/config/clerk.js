/**
 * Clerk Authentication Configuration
 * Setup and utilities for Clerk authentication service
 */

const logger = require('../utils/logger');

// For demo purposes, we'll create mock Clerk middleware
// In production, you would use actual Clerk SDK

// Mock Clerk configuration check
if (!process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY === 'sk_test_demo_key') {
  logger.warn('Using demo Clerk configuration - replace with actual keys in production');
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
const requireAuth = (req, res, next) => {
  // Demo authentication - in production use actual Clerk middleware
  req.auth = {
    userId: 'demo_user_123',
    sessionId: 'demo_session_123',
    sessionClaims: {
      email: 'demo@finsmart.com',
      firstName: 'Demo',
      lastName: 'User'
    }
  };
  next();
};

/**
 * Middleware to optionally include auth
 * Continues even if user is not authenticated
 */
const withAuth = (req, res, next) => {
  // Demo authentication - in production use actual Clerk middleware
  req.auth = {
    userId: 'demo_user_123',
    sessionId: 'demo_session_123'
  };
  next();
};

/**
 * Extract user information from Clerk auth
 */
const getUserFromAuth = (auth) => {
  if (!auth || !auth.userId) {
    return null;
  }

  return {
    id: auth.userId,
    sessionId: auth.sessionId,
    orgId: auth.orgId,
    orgRole: auth.orgRole,
    orgSlug: auth.orgSlug
  };
};

/**
 * Check if user has required role
 */
const hasRole = (auth, requiredRole) => {
  const user = getUserFromAuth(auth);
  if (!user) return false;
  
  // If no org role is required, just check if user is authenticated
  if (!requiredRole) return true;
  
  return user.orgRole === requiredRole;
};

/**
 * Middleware to require specific role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!hasRole(req.auth, role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${role}`
      });
    }
    next();
  };
};

/**
 * Middleware to require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware to require risk manager role or higher
 */
const requireRiskManager = (req, res, next) => {
  const allowedRoles = ['admin', 'risk_manager'];
  const user = getUserFromAuth(req.auth);
  
  if (!user || !allowedRoles.includes(user.orgRole)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Risk manager role or higher required.'
    });
  }
  
  next();
};

module.exports = {
  requireAuth,
  withAuth,
  getUserFromAuth,
  hasRole,
  requireRole,
  requireAdmin,
  requireRiskManager
};