const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const ProcessPillar = sequelize.define('ProcessPillar', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  what_it_means: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  why_it_matters: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  how_we_ensure_it: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icon_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'ProcessPillars',
  timestamps: true,
});

module.exports = ProcessPillar;
