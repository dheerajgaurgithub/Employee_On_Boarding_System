import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load current user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.setToken(token);
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user:', error);
      localStorage.removeItem('token');
      apiService.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!currentUser?.role) {
      console.warn('No user role to determine user scope.');
      return;
    }

    try {
      let allUsers = [];

      if (currentUser.role === 'admin') {
        allUsers = await apiService.getUsers();
      } else if (currentUser.role === 'hr') {
        const [employees, admins] = await Promise.all([
          apiService.getUsersByRole('employee'),
          apiService.getUsersByRole('admin'),
        ]);
        allUsers = [...employees, ...admins];
      } else if (currentUser.role === 'employee') {
        const hrs = await apiService.getUsersByRole('hr');
        allUsers = hrs.filter(hr => hr._id === currentUser.createdBy);
      }

      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      localStorage.setItem('token', response.token);
      setCurrentUser(response.user);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setCurrentUser(null);
    apiService.setToken(null);
    localStorage.removeItem('token');
  };

  const addUser = async (userData) => {
    try {
      const response = await apiService.createUser(userData);
      await loadUsers();
      return response;
    } catch (error) {
      console.error('Failed to add user:', error);
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const updatedUser = await apiService.updateUser(userId, updates);
      setUsers(prev =>
        prev.map(user => (user._id === userId ? updatedUser : user))
      );
      if (currentUser?._id === userId) {
        setCurrentUser(updatedUser);
      }
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const getUsersByRole = (role) => {
    if (!currentUser) return [];

    if (role === 'hr' && currentUser.role === 'admin') {
      return users.filter(user => user.role === 'hr');
    }

    if (role === 'employee' && currentUser.role === 'hr') {
      return users.filter(
        user => user.role === 'employee' && user.createdBy === currentUser._id
      );
    }

    if (role === 'hr' && currentUser.role === 'employee') {
      return users.filter(user => user._id === currentUser.createdBy);
    }

    return users.filter(user => user.role === role);
  };

  const getUserById = (id) => {
    return users.find(user => user._id === id);
  };

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const value = {
    currentUser,
    setCurrentUser,
    users,
    loading,
    login,
    logout,
    addUser,
    updateUser,
    getUsersByRole,
    getUserById,
    loadUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
