const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  admin_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Administrator',
  },
  admin_email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'UPDATE',
  },
  target_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'System',
  },
  target_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'admin_logs',
});

module.exports = AdminLog;
