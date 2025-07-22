const express = require('express');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
// Fetch all notifications for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('🔔 Error fetching notifications:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications
// Create a new notification
router.post('/', auth, async (req, res) => {
  try {
    const { userId, title, message, type = 'general' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'userId, title, and message are required' });
    }

    const notification = new Notification({
      userId,
      title,
      message,
      type
    });

    await notification.save();
    await notification.populate('userId', 'name email role');

    // Emit real-time notification if socket exists
    if (req.io && req.io.to) {
      req.io.to(userId.toString()).emit('new_notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error('🔔 Error creating notification:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// PUT /api/notifications/:id/read
// Mark a single notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    ).populate('userId', 'name email role');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('🔔 Error marking notification as read:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all
// Mark all user's notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    const updatedNotifications = await Notification.find({ userId: req.user._id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      message: 'All notifications marked as read',
      notifications: updatedNotifications
    });
  } catch (error) {
    console.error('🔔 Error marking all notifications as read:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

module.exports = router;
