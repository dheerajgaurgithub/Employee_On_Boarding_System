const express = require('express');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content, type = 'text' } = req.body;
    
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
    const Notification = require('../models/Notification');
    await Notification.create({
      userId: receiverId,
      title: 'New Message',
      message: `You have received a new message from ${message.senderId.name}`,
      type: 'general',
      read: false
    });
    
    // Emit real-time message
    req.io.to(receiverId).emit('receive_message', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    // Only receiver can mark as read
    if (String(message.receiverId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    message.read = true;
    await message.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;