const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-spark');
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@sarkarispark.com';
    const adminPassword = 'adminpassword123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.role = 'admin';
      admin.password = adminPassword;
      await admin.save();
      console.log('Admin account updated:');
    } else {
      admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '9999999999',
        role: 'admin'
      });
      console.log('Admin account created successfully:');
    }

    console.log('---------------------------------');
    console.log('Email:   ', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:    ', admin.role);
    console.log('---------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
