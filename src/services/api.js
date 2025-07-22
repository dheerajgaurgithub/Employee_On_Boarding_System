import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://employee-on-boarding-system.onrender.com/api';
console.log('🔗 API URL:', apiUrl);

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: apiUrl,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    const token = localStorage.getItem('token');
    if (token) this.setToken(token);
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
      this.api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete this.api.defaults.headers.Authorization;
    }
  }

  async request(endpoint, options = {}) {
    try {
      const res = await this.api.request({
        url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
        ...options,
      });
      return res.data;
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      console.error('❌ API Error:', msg);
      if (status === 401) {
        this.setToken(null);
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      if (status === 403) throw new Error('Access denied.');
      if (status === 404) throw new Error('Resource not found.');
      throw new Error(msg);
    }
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    if (response.token) this.setToken(response.token);
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // -------------------- Users --------------------
  async getUsers() {
    return this.request('/users');
  }

  async getUsersByRole(role) {
    return this.request(`/users/role/${role}`);
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      data: userData,
    });
  }

  async updateUser(userId, updates) {
    if (!userId) throw new Error('User ID is required');
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      data: updates,
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  // -------------------- Tasks --------------------
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      data: taskData,
    });
  }

  async updateTask(taskId, updates) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      data: updates,
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // -------------------- Leaves --------------------
  async getLeaves() {
    return this.request('/leaves');
  }

  async createLeave(leaveData) {
    return this.request('/leaves', {
      method: 'POST',
      data: leaveData,
    });
  }

  async updateLeave(leaveId, updates) {
    return this.request(`/leaves/${leaveId}`, {
      method: 'PUT',
      data: updates,
    });
  }

  // -------------------- Attendance --------------------
  async getAttendance() {
    return this.request('/attendance');
  }

  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async getEmployeesForAttendance() {
    return this.request('/attendance/employees');
  }

  async markAttendance(attendanceData) {
    return this.request('/attendance', {
      method: 'POST',
      data: attendanceData,
    });
  }

  // -------------------- Meetings --------------------
  async getMeetings() {
    return this.request('/meetings');
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      data: meetingData,
    });
  }

  async updateMeeting(meetingId, updates) {
    return this.request(`/meetings/${meetingId}`, {
      method: 'PUT',
      data: updates,
    });
  }

  // -------------------- Notifications --------------------
  async getNotifications() {
    return this.request('/notifications');
  }

  async createNotification(notificationData) {
    return this.request('/notifications', {
      method: 'POST',
      data: notificationData,
    });
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // -------------------- Messages --------------------
  async getMessages(userId) {
    return this.request(`/messages/${userId}`);
  }

  async sendMessage(messageData) {
    return this.request('/messages', {
      method: 'POST',
      data: messageData,
    });
  }

  async markMessageRead(messageId) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }
}

export default new ApiService();
