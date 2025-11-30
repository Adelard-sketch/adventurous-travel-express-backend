// Script to make a user an admin
const mongoose = require('mongoose');
const User = require('./models/user');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/adventurous-travel');
    console.log('Connected to MongoDB');

    // Get email and optional password from command line arguments
    const email = process.argv[2];
    const customPassword = process.argv[3];
    
    if (!email) {
      console.log('Usage: node make-admin.js <user-email> [password]');
      console.log('Example: node make-admin.js admin@example.com MyPassword123');
      console.log('If password is not provided, default "Admin@123" will be used');
      process.exit(1);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      console.log('\nCreating new admin user...');
      
      const bcrypt = require('bcrypt');
      const password = customPassword || 'Admin@123';
      
      const newAdmin = new User({
        name: 'Admin User',
        email: email.toLowerCase(),
        password: password,
        role: 'admin',
        phone: '+1234567890'
      });

      await newAdmin.save();
      console.log(`\n✅ Admin user created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log(`\n⚠️  Please change the password after first login!`);
    } else {
      user.role = 'admin';
      if (customPassword) {
        user.password = customPassword;
        console.log(`✅ User ${user.name} (${user.email}) is now an admin with new password!`);
      } else {
        console.log(`✅ User ${user.name} (${user.email}) is now an admin!`);
      }
      await user.save();
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

makeAdmin();
