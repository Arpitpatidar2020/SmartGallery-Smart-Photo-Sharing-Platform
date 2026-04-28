const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smartgallery.com',
      password: 'admin123456',
      role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin123456`);
    console.log('   ⚠️  Change this password immediately!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
