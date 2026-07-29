const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Inquiry = require('./inquiry.model');
const Product = require('../products/product.model');

const InquiryItem = sequelize.define('InquiryItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  inquiry_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Inquiry,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  variant_details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'InquiryItems',
  timestamps: true,
});

Inquiry.hasMany(InquiryItem, { foreignKey: 'inquiry_id', as: 'items' });
InquiryItem.belongsTo(Inquiry, { foreignKey: 'inquiry_id' });

Product.hasMany(InquiryItem, { foreignKey: 'product_id' });
InquiryItem.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = InquiryItem;
