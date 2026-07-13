const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const SiteFaq = sequelize.define('SiteFaq', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'SiteFaqs',
  timestamps: true,
});

module.exports = SiteFaq;
