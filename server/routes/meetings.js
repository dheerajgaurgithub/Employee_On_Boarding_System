const express = require('express');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/meetings
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
    console.error('📅 Error fetching meetings:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to fetch meetings' });
  }
});

// POST /api/meetings
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, attendees, dateTime, duration } = req.body;

    if (!title || !attendees?.length || !dateTime || !duration) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

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

      if (req.io && req.io.to) {
        req.io.to(attendeeId.toString()).emit('new_notification', notification);
      }
    }

    res.status(201).json(meeting);
  } catch (error) {
    console.error('📅 Error creating meeting:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to create meeting' });
  }
});

// PUT /api/meetings/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const isAuthorized =
      meeting.scheduledBy.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    Object.assign(meeting, updates);
    await meeting.save();
    await meeting.populate('scheduledBy', 'name email');
    await meeting.populate('attendees', 'name email');

    res.json(meeting);
  } catch (error) {
    console.error('📅 Error updating meeting:', error.stack || error.message);
    res.status(500).json({ message: 'Failed to update meeting' });
  }
});

module.exports = router;
