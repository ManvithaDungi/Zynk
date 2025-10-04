const jwt = require("jsonwebtoken");

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
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
  const token = req.cookies?.token;
  return token || null;
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

module.exports = {
  verifyToken,
  getTokenFromRequest,
  getUserFromRequest,
  authenticateToken
};
