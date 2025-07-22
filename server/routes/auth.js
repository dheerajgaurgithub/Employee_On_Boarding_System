const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // ✅ REQUIRED IMPORT
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, user });
  } catch (error) {
    console.error('❌ Login error:', error); // ✅ LOG the real error
    res.status(500).json({ message: 'Server error during login' });
  }
});


// POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('🔐 Logout Error:', error.stack || error.message);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('🔐 Fetch Current User Error:', error.stack || error.message);
    res.status(500).json({ message: 'Server error fetching current user' });
  }
});

module.exports = router;
