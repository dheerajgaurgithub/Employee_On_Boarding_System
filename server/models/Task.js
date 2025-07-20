const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  submission: {
    documentUrl: {
      type: String,
      trim: true
    },
    documentType: {
      type: String,
      enum: ['pdf', 'text', 'other'],
      default: 'other'
    },
    notes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);