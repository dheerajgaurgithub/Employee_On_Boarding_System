const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get attendance records
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    } else if (req.user.role === 'hr') {
      // HR can see attendance of their employees
      const employees = await User.find({ createdBy: req.user._id });
      if (employees.length === 0) {
        return res.json([]);
      }
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    }
    // Admin can see all attendance records
    
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name email role')
      .populate('markedBy', 'name email role')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// Get today's attendance
router.get('/today', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let query = {
      date: { $gte: today, $lt: tomorrow }
    };
    
    if (req.user.role === 'hr') {
      const employees = await User.find({ createdBy: req.user._id });
      if (employees.length === 0) {
        return res.json([]);
      }
      const employeeIds = employees.map(emp => emp._id);
      query.employeeId = { $in: employeeIds };
    }
    
    const attendance = await Attendance.find(query)
      .populate('employeeId', 'name email role')
      .populate('markedBy', 'name email role');
    
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Failed to fetch today\'s attendance' });
  }
});

// Get employees for attendance marking
router.get('/employees', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    let query = { role: 'employee' };
    
    if (req.user.role === 'hr') {
      query.createdBy = req.user._id;
    }
    
    const employees = await User.find(query).select('name email role');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

// Mark attendance
router.post('/', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { employeeId, status, checkInTime } = req.body;

    // Validate required fields
    if (!employeeId || !status || (status === 'present' && !checkInTime)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify employee exists and HR has access
    const employee = await User.findOne({ 
      _id: employeeId, 
      role: 'employee',
      ...((req.user.role === 'hr') ? { createdBy: req.user._id } : {})
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found or access denied' });
    }
    
    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: { $gte: today, $lt: tomorrow }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }
    
    const attendance = new Attendance({
      employeeId,
      employeeName: employee.name,
      status,
      checkInTime,
      markedBy: req.user._id
    });
    
    await attendance.save();
    await attendance.populate('employeeId', 'name email role');
    await attendance.populate('markedBy', 'name email role');
    
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

module.exports = router;