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
    try {
      let allUsers;
      if (!currentUser?.role) {
        console.error('No user role found:', currentUser);
        return;
      }

      console.log(`Loading users for role: ${currentUser.role}`);
      
      if (currentUser.role === 'admin') {
        allUsers = await apiService.getUsers();
        console.log('Admin: Loaded all users:', allUsers.length);
      } else if (currentUser.role === 'hr') {
        // HR needs access to both admin and employee users
        const employees = await apiService.getUsersByRole('employee');
        const admins = await apiService.getUsersByRole('admin');
        allUsers = [...employees, ...admins];
        console.log('HR: Loaded employees and admins:', allUsers.length);
      } else if (currentUser.role === 'employee') {
        // Employee needs access to their HR
        if (!currentUser.createdBy) {
          console.error('Employee has no assigned HR (createdBy):', currentUser);
          return;
        }
        const hrs = await apiService.getUsersByRole('hr');
        allUsers = hrs.filter(hr => hr._id === currentUser.createdBy);
        console.log('Employee: Found HR:', allUsers.length > 0);
      } else {
        console.warn('Unknown user role:', currentUser.role);
        allUsers = [];
      }
      
      if (!allUsers?.length) {
        console.warn('No users loaded for role:', currentUser.role);
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
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? updatedUser : u))
      );
      if (currentUser && currentUser._id === userId) {
        setCurrentUser(updatedUser);
      }
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const getUsersByRole = (role) => {
    if (role === 'hr' && currentUser?.role === 'admin') {
      return users.filter((u) => u.role === role);
    } else if (role === 'employee' && currentUser?.role === 'hr') {
      return users.filter(
        (u) => u.role === role && u.createdBy === currentUser._id
      );
    }
    return users.filter((u) => u.role === role);
  };

  const getUserById = (id) => {
    return users.find((u) => u._id === id);
  };

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  const value = {
    currentUser,
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
