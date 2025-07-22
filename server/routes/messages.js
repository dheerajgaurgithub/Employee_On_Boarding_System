const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:userId
// Get all messages between logged-in user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    })
      .populate('senderId', 'name profilePicture')
      .populate('receiverId', 'name profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('💬 Error fetching messages:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST /api/messages
// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content,
      type
    });

    await message.save();
    await message.populate('senderId', 'name profilePicture');
    await message.populate('receiverId', 'name profilePicture');

    // Create notification for receiver
    const notification = new Notification({
      userId: receiverId,
      title: 'New Message',
      message: `You have received a new message from ${message.senderId.name}`,
      type: 'general',
      read: false
    });
    await notification.save();

    // Emit real-time event if socket exists
    if (req.io && req.io.to) {
      req.io.to(receiverId.toString()).emit('receive_message', message);
      req.io.to(receiverId.toString()).emit('new_notification', notification);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('💬 Error sending message:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// PUT /api/messages/:messageId/read
// Mark a message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.read = true;
    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error('💬 Error marking message as read:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

module.exports = router;
