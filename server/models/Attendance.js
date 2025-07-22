const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Optional: keep if needed for fast read; otherwise remove
  employeeName: {
    type: String
    // Consider removing this if you always populate from User
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize date to midnight
      return today;
    }
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  checkInTime: {
    type: Date // Change from String to Date for better accuracy
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Enforce unique attendance per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
