const express = require('express');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'hr') {
      query.assignedBy = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can see all tasks
      query = {};
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;
    
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      priority,
      dueDate
    });
    
    await task.save();
    await task.populate('assignedTo', 'name email role');
    await task.populate('assignedBy', 'name email role');
    
    // Create notification
    const notification = new Notification({
      userId: assignedTo,
      title: 'New Task Assigned',
      message: `${req.user.name} has assigned you a new task: ${title}`,
      type: 'task'
    });
    await notification.save();
    
    // Emit real-time notification
    req.io.to(assignedTo).emit('new_notification', notification);
    
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Handle task completion with submission
    if (updates.status === 'completed') {
      updates.submittedAt = new Date();
      if (updates.submission) {
        updates.submission = {
          documentUrl: updates.submission.documentUrl,
          documentType: updates.submission.documentType || 'other',
          notes: updates.submission.notes
        };
      }
    }
    
    const task = await Task.findByIdAndUpdate(id, updates, { new: true })
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Notify assigner about status change
    if (updates.status) {
      const notificationMessage = updates.status === 'completed' && updates.submission
        ? `Task "${task.title}" has been completed with document submission`
        : `Task "${task.title}" status changed to ${updates.status}`;

      const notification = new Notification({
        userId: task.assignedBy._id,
        title: 'Task Status Updated',
        message: notificationMessage,
        type: 'task'
      });
      await notification.save();
      
      req.io.to(task.assignedBy._id.toString()).emit('new_notification', notification);
    }
    
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Only task assigner can delete
    if (task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;