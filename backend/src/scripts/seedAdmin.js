require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const User = require('../modules/users/user.model');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
      process.exit(1);
    }
    
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const existingAdmin = await User.findOne({ where: { email } });
    if (existingAdmin) {
      existingAdmin.password = password;
      existingAdmin.role = 'admin';
      existingAdmin.is_verified = true;
      await existingAdmin.save();
      console.log('Admin already exists. Password and role updated to match .env file.');
      process.exit(0);
    }
    
    await User.create({
      email,
      password,
      role: 'admin',
      is_verified: true,
    });
    
    console.log('Admin user created successfully in Users table.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
