const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dheerajgaurcs23:dheerajgaur_mongodb@cluster0.jigwlh0.mongodb.net/Employee_Onboarding_System?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminEmail = 'superadmin@onboarding.in';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists.');
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('supersecure@2025', 10);

    // Create new admin user
    const admin = new User({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: "+919927270090",
      profilePicture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      status: 'active',
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully:');
    console.log('📧 Email: superadmin@onboarding.in');
    console.log('🔐 Password: supersecure@2025\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
