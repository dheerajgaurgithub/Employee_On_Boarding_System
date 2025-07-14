const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/', auth, async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    const notification = new Notification({
      userId,
      title,
      message,
      type
    });

    await notification.save();
    await notification.populate('userId', 'name email role');

    // Emit real-time notification
    req.io.to(userId.toString()).emit('new_notification', notification);

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
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
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Mark all notifications as read
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
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

module.exports = router;