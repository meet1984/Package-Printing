const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'quoted', 'closed'),
    defaultValue: 'pending',
  },
  department: {
    type: DataTypes.ENUM('general', 'bulk', 'support', 'partnership', 'careers'),
    defaultValue: 'general',
  },
  attachment_url: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'Inquiries',
  timestamps: true,
});

module.exports = Inquiry;
