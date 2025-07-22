const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['task', 'leave', 'meeting', 'general'],
    default: 'general'
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'type', // Can dynamically reference Task, LeaveRequest, etc.
    required: false
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date // Optional timestamp for when it was read
  }
}, {
  timestamps: true
});

// Optional: mark readAt when read is set to true
notificationSchema.pre('save', function (next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
