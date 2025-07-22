const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 🔐 Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    // Check if token is provided in the Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '❌ No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    // Ensure JWT_SECRET is defined
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET is not defined in .env');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: '❌ Invalid token structure.' });
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: '❌ Token is invalid: user not found.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('🔐 Auth Middleware Error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '🔒 Token has expired. Please log in again.' });
    }

    return res.status(401).json({ message: '❌ Invalid token. Authorization denied.' });
  }
};

// 🔐 Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '🚫 Access denied: insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
