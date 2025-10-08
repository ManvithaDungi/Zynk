const { checkConnectionHealth } = require('../config/db');

/**
 * Middleware to check database connection health
 * Returns 503 Service Unavailable if database is not connected
 */
const checkDBHealth = (req, res, next) => {
  if (!checkConnectionHealth()) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      error: 'DATABASE_CONNECTION_ERROR'
    });
  }
  next();
};

/**
 * Middleware to check database health for critical operations
 * Only applies to routes that require database access
 */
const requireDBConnection = (req, res, next) => {
  if (!checkConnectionHealth()) {
    console.error('❌ Database connection lost during request:', req.path);
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Database connection lost.',
      error: 'DATABASE_CONNECTION_LOST'
    });
  }
  next();
};

module.exports = {
  checkDBHealth,
  requireDBConnection
};
