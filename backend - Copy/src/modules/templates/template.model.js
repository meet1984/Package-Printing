const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Template = sequelize.define('Template', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  baseImageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  printArea: {
    type: DataTypes.JSON, // {x, y, width, height, rotation}
    allowNull: true,
  },
  constraints: {
    type: DataTypes.JSON, // {minScale, maxScale, minRotation, maxRotation}
    allowNull: true,
  },
  shadingMapUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  faces: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  }
}, {
  timestamps: true,
});

module.exports = Template;
