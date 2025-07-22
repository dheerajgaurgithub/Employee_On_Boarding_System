const mongoose = require('mongoose');

// 📝 Embedded subdocument for task submissions
const submissionSchema = new mongoose.Schema({
  documentUrl: {
    type: String,
    trim: true,
    match: /^https?:\/\/.+/ // Optional: basic URL validation
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
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
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
  submission: submissionSchema
}, {
  timestamps: true
});

// Optional: pre-save hook to set `submittedAt` if submission is added
taskSchema.pre('save', function (next) {
  if (this.submission && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
