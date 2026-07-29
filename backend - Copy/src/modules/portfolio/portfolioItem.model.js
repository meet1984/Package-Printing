const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('../products/product.model');

const PortfolioItem = sequelize.define('PortfolioItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  related_product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Product,
      key: 'id'
    }
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'PortfolioItems',
  paranoid: true, // soft deletes
  timestamps: true,
});

Product.hasMany(PortfolioItem, { foreignKey: 'related_product_id' });
PortfolioItem.belongsTo(Product, { foreignKey: 'related_product_id' });

module.exports = PortfolioItem;
