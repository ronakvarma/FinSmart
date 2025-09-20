/**
 * Clerk Authentication Configuration
 * Setup and utilities for Clerk authentication service
 */

const { ClerkExpressRequireAuth, ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const logger = require('../utils/logger');

// Validate Clerk configuration
if (!process.env.CLERK_SECRET_KEY) {
  logger.error('CLERK_SECRET_KEY is required');
  process.exit(1);
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
const requireAuth = ClerkExpressRequireAuth({
  onError: (error) => {
    logger.error('Clerk authentication error:', error);
    return {
      status: 401,
      message: 'Authentication required'
    };
  }
});

/**
 * Middleware to optionally include auth
 * Continues even if user is not authenticated
 */
const withAuth = ClerkExpressWithAuth({
  onError: (error) => {
    logger.warn('Clerk authentication warning:', error);
  }
});

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