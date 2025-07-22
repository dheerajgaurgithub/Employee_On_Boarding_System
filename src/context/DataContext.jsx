import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ----------- Loaders -----------
  const loadTasks = useCallback(async () => {
    try {
      const data = await apiService.getTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks');
    }
  }, []);

  const loadLeaves = useCallback(async () => {
    try {
      const data = await apiService.getLeaves();
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Failed to load leaves:', error);
      setError('Failed to load leave requests');
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    try {
      const data = await apiService.getAttendance();
      setAttendance(data || []);
    } catch (error) {
      console.error('Failed to load attendance:', error);
      setError('Failed to load attendance');
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    try {
      const data = await apiService.getMeetings();
      setMeetings(data || []);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setError('Failed to load meetings');
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError('Failed to load notifications');
    }
  }, []);

  // ----------- Task Methods -----------
  const addTask = async (taskData) => {
    try {
      const task = await apiService.createTask(taskData);
      setTasks(prev => [...prev, task]);
      return task;
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const task = await apiService.updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t._id === taskId ? task : t));
      return task;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const getTasksByUser = useCallback((userId) =>
    tasks.filter(t => t.assignedTo?._id === userId || t.assignedTo === userId), [tasks]);

  const getTasksByAssigner = useCallback((assignerId) =>
    tasks.filter(t => t.assignedBy?._id === assignerId || t.assignedBy === assignerId), [tasks]);

  // ----------- Leave Methods -----------
  const addLeaveRequest = async (data) => {
    try {
      const leave = await apiService.createLeave(data);
      setLeaveRequests(prev => [...prev, leave]);
      return leave;
    } catch (error) {
      console.error('Failed to add leave request:', error);
      throw error;
    }
  };

  const updateLeaveRequest = async (leaveId, updates) => {
    try {
      const leave = await apiService.updateLeave(leaveId, updates);
      setLeaveRequests(prev => prev.map(l => l._id === leaveId ? leave : l));
      return leave;
    } catch (error) {
      console.error('Failed to update leave request:', error);
      throw error;
    }
  };

  const getLeavesByUser = useCallback((userId) =>
    leaveRequests.filter(l => l.employeeId?._id === userId || l.employeeId === userId), [leaveRequests]);

  const getLeavesByApprover = useCallback((approverId) =>
    leaveRequests.filter(l => l.appliedTo?._id === approverId || l.appliedTo === approverId), [leaveRequests]);

  // ----------- Attendance Methods -----------
  const addAttendance = async (data) => {
    try {
      const entry = await apiService.markAttendance(data);
      setAttendance(prev => [...prev, entry]);
      return entry;
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      throw error;
    }
  };

  const getAttendanceByUser = useCallback((userId) =>
    attendance.filter(a => a.employeeId?._id === userId), [attendance]);

  const getTodayAttendance = useCallback(() => {
    const today = new Date().toDateString();
    return attendance.filter(a => new Date(a.date).toDateString() === today);
  }, [attendance]);

  // ----------- Meeting Methods -----------
  const addMeeting = async (data) => {
    try {
      const meeting = await apiService.createMeeting(data);
      setMeetings(prev => [...prev, meeting]);
      return meeting;
    } catch (error) {
      console.error('Failed to add meeting:', error);
      throw error;
    }
  };

  const updateMeeting = async (id, updates) => {
    try {
      const meeting = await apiService.updateMeeting(id, updates);
      setMeetings(prev => prev.map(m => m._id === id ? meeting : m));
      return meeting;
    } catch (error) {
      console.error('Failed to update meeting:', error);
      throw error;
    }
  };

  const getMeetingsByUser = useCallback((userId) =>
    meetings.filter(m =>
      m.scheduledBy?._id === userId ||
      (m.attendees && m.attendees.some(a => a?._id === userId))
    ), [meetings]);

  // ----------- Notification Methods -----------
  const addNotification = async (data) => {
    try {
      const notification = await apiService.createNotification(data);
      setNotifications(prev => [notification, ...prev]);
      return notification;
    } catch (error) {
      console.error('Failed to add notification:', error);
      throw error;
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const updated = await apiService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      await loadNotifications();
      return updated;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const { notifications: updatedNotifications } = await apiService.markAllNotificationsRead();
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  };

  const getNotificationsByUser = useCallback((userId) =>
    notifications
      .filter(n => n.userId === userId || n.userId?._id === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [notifications]);

  // ----------- Message Methods -----------
  const loadMessages = useCallback(async (userId) => {
    try {
      const data = await apiService.getMessages(userId);
      setMessages(data);
      return data;
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }, []);

  const addMessage = async (data) => {
    try {
      const msg = await apiService.sendMessage(data);
      setMessages(prev => [...prev, msg]);
      await loadNotifications(); // sync notifications
      return msg;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const markMessageRead = async (messageId) => {
    try {
      await apiService.markMessageRead(messageId);
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const getMessagesBetweenUsers = useCallback((u1, u2) =>
    messages
      .filter(m => {
        const sender = m.senderId?._id || m.senderId;
        const receiver = m.receiverId?._id || m.receiverId;
        return (sender === u1 && receiver === u2) || (sender === u2 && receiver === u1);
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)), [messages]);

  // ----------- Utility Methods -----------
  const getUsersByRole = async (role) => {
    try {
      return await apiService.getUsersByRole(role.toLowerCase());
    } catch (error) {
      console.error(`Failed to get users by role (${role})`, error);
      return [];
    }
  };

  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadTasks(),
        loadLeaves(),
        loadAttendance(),
        loadMeetings(),
        loadNotifications(),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [currentUser, loadTasks, loadLeaves, loadAttendance, loadMeetings, loadNotifications]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(loadNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [currentUser, loadNotifications]);

  return (
    <DataContext.Provider value={{
      tasks, addTask, updateTask, getTasksByUser, getTasksByAssigner,
      leaveRequests, addLeaveRequest, updateLeaveRequest, getLeavesByUser, getLeavesByApprover,
      attendance, addAttendance, getAttendanceByUser, getTodayAttendance,
      meetings, addMeeting, updateMeeting, getMeetingsByUser,
      notifications, addNotification, markNotificationRead, markAllNotificationsRead, getNotificationsByUser,
      messages, loadMessages, addMessage, getMessagesBetweenUsers,
      loading, error, refresh: loadAllData,
      getUsersByRole
    }}>
      {children}
    </DataContext.Provider>
  );
};
