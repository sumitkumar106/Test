const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * Verifies token from Authorization header and attaches user data to req.user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Middleware to check if user has driver role
 * Must be used after authenticateToken
 */
const requireDriver = (req, res, next) => {
  if (req.user && req.user.role === 'driver') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Driver role required.'
    });
  }
};

/**
 * Middleware to check if user has passenger role
 * Must be used after authenticateToken
 */
const requirePassenger = (req, res, next) => {
  if (req.user && req.user.role === 'passenger') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Passenger role required.'
    });
  }
};

module.exports = {
  authenticateToken,
  requireDriver,
  requirePassenger
};
