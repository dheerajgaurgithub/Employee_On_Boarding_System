const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/tasks - Fetch tasks based on role
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'employee') {
      query.assignedTo = req.user._id;
    } else if (req.user.role === 'hr') {
      query.assignedBy = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks - Create a task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignedTo are required' });
    }

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

    // Notify assignee
    const notification = new Notification({
      userId: assignedTo,
      title: 'New Task Assigned',
      message: `${req.user.name} assigned you a new task: ${title}`,
      type: 'task'
    });
    await notification.save();

    if (req.io) req.io.to(assignedTo.toString()).emit('new_notification', notification);

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const originalTask = await Task.findById(id);
    if (!originalTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let notifyUserId = null;
    let notificationTitle = '';
    let notificationMessage = '';

    // Handle task completion
    if (updates.status === 'completed') {
      updates.submittedAt = new Date();
      if (updates.submission) {
        updates.submission = {
          documentUrl: updates.submission.documentUrl,
          documentType: updates.submission.documentType || 'other',
          notes: updates.submission.notes
        };
      }
      notifyUserId = originalTask.assignedBy;
      notificationTitle = 'Task Completed';
      notificationMessage = `Task "${updates.title || originalTask.title}" was completed.`;
    }

    // Approval logic
    if (updates.approvalStatus && ['approved', 'rejected'].includes(updates.approvalStatus)) {
      notifyUserId = originalTask.assignedTo;
      notificationTitle = `Task ${updates.approvalStatus.charAt(0).toUpperCase() + updates.approvalStatus.slice(1)}`;
      notificationMessage = `Your task "${originalTask.title}" has been ${updates.approvalStatus}.`;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true })
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task update failed' });
    }

    // Notify based on changes
    if (notifyUserId && notificationTitle && notificationMessage) {
      const notification = new Notification({
        userId: notifyUserId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'task'
      });
      await notification.save();
      if (req.io) req.io.to(notifyUserId.toString()).emit('new_notification', notification);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id/approval - Approve/reject task
router.put('/:id/approval', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!['approved', 'rejected'].includes(approvalStatus)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const task = await Task.findByIdAndUpdate(id, { approvalStatus }, { new: true })
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Notify employee
    const notification = new Notification({
      userId: task.assignedTo._id,
      title: `Task ${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}`,
      message: `Your task "${task.title}" has been ${approvalStatus}.`,
      type: 'task'
    });
    await notification.save();
    if (req.io) req.io.to(task.assignedTo._id.toString()).emit('new_notification', notification);

    res.json(task);
  } catch (error) {
    console.error('Error approving task:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.assignedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. Only assigner can delete the task.' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error.stack || error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
