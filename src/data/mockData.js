// Mock database simulation
export const initialUsers = [
  {
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@onboarding.in',
    password: 'admin@123',
    role: 'admin',
    phone: '+91-9876543210',
    profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    status: 'active',
    isOnline: true,
    salary: 0,
    createdAt: new Date('2024-01-01')
  }
];

export const initialTasks = [];
export const initialLeaveRequests = [];
export const initialAttendance = [];
export const initialMeetings = [];
export const initialNotifications = [];
export const initialMessages = [];

// Utility functions for data management
export const generateCredentials = (name, role) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const email = `${cleanName}@gla.ac.in`;
  const password = `${cleanName}@123`;
  return { email, password };
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};