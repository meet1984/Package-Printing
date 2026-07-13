const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  page_key: {
    type: DataTypes.STRING, // e.g. 'about', 'home_hero', 'how_we_print'
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.JSON, // JSON to store structured content or rich text html
    allowNull: true,
  }
}, {
  tableName: 'PageContents',
  timestamps: true,
});

module.exports = PageContent;
