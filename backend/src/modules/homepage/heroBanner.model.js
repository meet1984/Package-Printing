const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const HeroBanner = sequelize.define('HeroBanner', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  panel_position: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'left'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subtitle_links: {
    type: DataTypes.JSON, // Stores array of { label, link }
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cta_label: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cta_link: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'HeroBanners',
  timestamps: true,
});

module.exports = HeroBanner;
