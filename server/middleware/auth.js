const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '❌ No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is not defined in .env');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: '❌ Invalid token structure.' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: '❌ Token is invalid: user not found.' });
    }

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

// 🔐 Optional: Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '🚫 Access denied: insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, authorize };
