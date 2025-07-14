const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_onboarding');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gla.ac.in' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@gla.ac.in',
      password: 'admin@123',
      role: 'admin',
      phone: '+91-9876543210',
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'active'
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@gla.ac.in');
    console.log('Password: admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();