const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all users — Admin only
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET users by role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    const query = { role };

    // HR sees only their own employees
    if (req.user.role === 'hr' && role === 'employee') {
      query.createdBy = req.user._id;
    }

    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create user (Admin creates HR, HR creates Employees)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, salary, role, profilePicture } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }

    // Permission check
    if (req.user.role === 'admin' && role !== 'hr') {
      return res.status(403).json({ message: 'Admin can only create HR users' });
    }
    if (req.user.role === 'hr' && role !== 'employee') {
      return res.status(403).json({ message: 'HR can only create employee users' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate password: name@123 (sanitized)
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const password = `${cleanName}@123`;

    const newUser = new User({
      name,
      email,
      password,
      phone,
      salary: salary || 0,
      role,
      profilePicture:
        profilePicture ||
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdBy: req.user._id
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      credentials: { email, password }
    });
  } catch (error) {
    console.error('Error creating user:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Permission logic
    if (req.user._id.toString() !== id) {
      if (req.user.role === 'hr' && targetUser.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'employee') {
        return res.status(403).json({ message: 'Employees can only edit their own profile' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user (Admin or HR)
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // HR can only delete their own employees
    if (req.user.role === 'hr' && targetUser.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
