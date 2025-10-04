const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId, email, username) => {
  return jwt.sign(
    { userId, email, username }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Get token from request headers or cookies
const getTokenFromRequest = (req) => {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  return req.cookies?.token || null;
};

// Get user from request
const getUserFromRequest = (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
};

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  req.user = user;
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromRequest,
  getUserFromRequest,
  authenticateToken,
  requireAdmin
};