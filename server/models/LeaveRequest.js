const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Consider removing this to avoid redundancy
  employeeName: {
    type: String
    // Optional – only if you're not populating from User
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  appliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondedAt: {
    type: Date
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Optional – add this if you want to track the approver
  },
  type: {
    type: String,
    enum: ['sick', 'vacation', 'casual', 'other'],
    default: 'other'
    // Optional: define leave types
  }
}, {
  timestamps: true
});

// Validation: startDate must be before endDate
leaveRequestSchema.pre('save', function (next) {
  if (this.startDate > this.endDate) {
    return next(new Error('Start date must be before end date'));
  }
  next();
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
