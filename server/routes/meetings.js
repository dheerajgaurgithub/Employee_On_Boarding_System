const express = require('express');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get meetings
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'employee') {
      query.attendees = req.user._id;
    } else if (req.user.role === 'hr') {
      query.$or = [
        { scheduledBy: req.user._id },
        { attendees: req.user._id }
      ];
    }
    
    const meetings = await Meeting.find(query)
      .populate('scheduledBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ dateTime: -1 });
    
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create meeting
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, attendees, dateTime, duration } = req.body;
    // Generate a Google Meet link (simple random string for demo, replace with real API in production)
    const randomString = Math.random().toString(36).substring(2, 10);
    const googleMeetLink = `https://meet.google.com/${randomString}`;
    const meeting = new Meeting({
      title,
      description,
      scheduledBy: req.user._id,
      attendees,
      dateTime,
      duration,
      googleMeetLink
    });
    
    await meeting.save();
    await meeting.populate('scheduledBy', 'name email');
    await meeting.populate('attendees', 'name email');
    
    // Create notifications for attendees
    for (const attendeeId of attendees) {
      const notification = new Notification({
        userId: attendeeId,
        title: 'New Meeting Scheduled',
        message: `You have been invited to: ${title}`,
        type: 'meeting'
      });
      await notification.save();
      
      // Emit real-time notification
      req.io.to(attendeeId).emit('new_notification', notification);
    }
    
    res.status(201).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meeting
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const meeting = await Meeting.findByIdAndUpdate(id, updates, { new: true })
      .populate('scheduledBy', 'name email')
      .populate('attendees', 'name email');
    
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    
    res.json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;