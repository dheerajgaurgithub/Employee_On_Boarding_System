const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users by role
router.get('/role/:role', auth, async (req, res) => {
  try {
    const { role } = req.params;
    let query = { role };
    
    // HR can only see their own employees
    if (req.user.role === 'hr' && role === 'employee') {
      query.createdBy = req.user._id;
    }
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user (admin creates HR, HR creates employees)
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, salary, role, profilePicture } = req.body;
    
    // Check permissions
    if (req.user.role === 'admin' && role !== 'hr') {
      return res.status(403).json({ message: 'Admin can only create HR users' });
    }
    if (req.user.role === 'hr' && role !== 'employee') {
      return res.status(403).json({ message: 'HR can only create employee users' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Generate password (name@123)
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const password = `${cleanName}@123`;
    
    const user = new User({
      name,
      email,
      password,
      phone,
      salary: salary || 0,
      role,
      profilePicture: profilePicture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      createdBy: req.user._id
    });
    
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      user: userResponse,
      credentials: { email, password }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Users can only update their own profile or admin/HR can update their subordinates
    if (req.user._id.toString() !== id) {
      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permissions
      if (req.user.role === 'hr' && targetUser.createdBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.user.role === 'employee') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/:id', auth, authorize('admin', 'hr'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permissions
    if (req.user.role === 'hr' && user.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;