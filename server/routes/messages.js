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
    
    // Emit real-time message
    req.io.to(receiverId).emit('new_message', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;