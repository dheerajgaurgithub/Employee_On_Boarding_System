const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('📩 Login attempt with email:', email);

    if (!email || !password) {
      console.warn('⚠️ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn('⚠️ No user found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('⚠️ Incorrect password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET not defined in environment');
      return res.status(500).json({ message: 'Server misconfiguration: JWT secret missing' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    console.log('✅ Login successful:', email);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.stack || error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 */
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('🔐 Logout error:', error.stack || error.message);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('🔐 Fetch current user error:', error.stack || error.message);
    res.status(500).json({ message: 'Server error fetching current user' });
  }
});

module.exports = router;
