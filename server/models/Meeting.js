const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // In minutes
    default: 60,
    min: 1
  },
  googleMeetLink: {
    type: String,
    trim: true,
    match: /^https?:\/\/(meet\.google\.com)\/[a-z0-9-]+$/i,
    // Optional: match a Google Meet URL pattern
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
});

// Optional: prevent past scheduling
meetingSchema.pre('save', function (next) {
  if (this.isNew && this.dateTime < new Date()) {
    return next(new Error('Meeting time must be in the future'));
  }
  next();
});

// Optional: virtual field for calculated end time
meetingSchema.virtual('endTime').get(function () {
  return new Date(this.dateTime.getTime() + this.duration * 60000);
});

meetingSchema.set('toJSON', { virtuals: true });
meetingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Meeting', meetingSchema);
