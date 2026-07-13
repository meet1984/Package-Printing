const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./product.model');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING, // e.g. 'size', 'color', 'material'
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING, // e.g. 'Large', 'Red', 'Kraft'
    allowNull: false,
  },
  price_modifier: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  }
}, {
  tableName: 'ProductVariants',
  timestamps: true,
});

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = ProductVariant;
