const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: function () {
      return this.type === 'text';
    },
    trim: true,
    minlength: 1
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    trim: true,
    required: function () {
      return this.type === 'image' || this.type === 'file';
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    // Optional: if you implement grouped chats
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Optional: support "delete for me" feature
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
