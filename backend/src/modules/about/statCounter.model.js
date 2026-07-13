const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const StatCounter = sequelize.define('StatCounter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  suffix: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '+',
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
  tableName: 'StatCounters',
  timestamps: true,
});

module.exports = StatCounter;
