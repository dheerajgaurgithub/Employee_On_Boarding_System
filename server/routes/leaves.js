const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get leave requests
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'hr') {
      // For HR, show leaves of employees they manage
      const employees = await User.find({ createdBy: req.user._id });
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    } else if (req.user.role === 'admin') {
      // Admin can see all leave requests
    }
    
    const leaves = await LeaveRequest.find(query)
      .populate('employeeId', 'name email role')
      .populate('appliedTo', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ message: 'Failed to fetch leave requests' });
  }
});

// Create leave request
router.post('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, reason, appliedTo } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !reason || !appliedTo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (start > end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Verify approver exists and has correct role
    let approver;
    if (req.user.role === 'employee') {
      approver = await User.findOne({ _id: appliedTo, role: 'hr' });
      if (!approver) {
        return res.status(404).json({ message: 'HR approver not found' });
      }
    } else if (req.user.role === 'hr') {
      approver = await User.findOne({ _id: appliedTo, role: 'admin' });
      if (!approver) {
        return res.status(404).json({ message: 'Admin approver not found' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized to create leave requests' });
    }
    
    const leaveRequest = new LeaveRequest({
      employeeId: req.user._id,
      employeeName: req.user.name,
      startDate,
      endDate,
      reason,
      appliedTo: approver._id
    });
    
    await leaveRequest.save();
    await leaveRequest.populate('employeeId', 'name email role');
    await leaveRequest.populate('appliedTo', 'name email role');
    
    // Create notification
    const notification = new Notification({
      userId: approver._id,
      title: 'New Leave Request',
      message: `${req.user.name} has applied for leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}\nReason: ${reason}`,
      type: 'leave'
    });
    await notification.save();
    
    // Emit real-time notification
    req.io.to(approver._id.toString()).emit('new_notification', notification);
    
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Failed to create leave request' });
  }
});

// Update leave request (approve/reject)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      { 
        status, 
        respondedAt: new Date(),
        comment: comment || undefined
      },
      { new: true }
    ).populate('employeeId', 'name email role')
     .populate('appliedTo', 'name email role');
    
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Verify authorization
    if (leaveRequest.appliedTo._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this leave request' });
    }
    
    // Notify employee about decision
    const notification = new Notification({
      userId: leaveRequest.employeeId._id,
      title: 'Leave Request Update',
      message: `Your leave request has been ${status}${comment ? `\nComment: ${comment}` : ''}`,
      type: 'leave'
    });
    await notification.save();
    
    req.io.to(leaveRequest.employeeId._id.toString()).emit('new_notification', notification);
    
    res.json(leaveRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
});

module.exports = router;