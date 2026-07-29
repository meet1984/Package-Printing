const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('../products/product.model');

const HomeScroller = sequelize.define('HomeScroller', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
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
  tableName: 'HomeScrollers',
  timestamps: true,
});

// Associations
HomeScroller.belongsToMany(Product, { through: 'HomeScrollerProducts', as: 'products', foreignKey: 'home_scroller_id' });
Product.belongsToMany(HomeScroller, { through: 'HomeScrollerProducts', as: 'homeScrollers', foreignKey: 'product_id' });

module.exports = HomeScroller;
