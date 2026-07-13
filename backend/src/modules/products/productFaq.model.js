const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Product = require('./product.model');

const ProductFaq = sequelize.define('ProductFaq', {
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
  }
}, {
  tableName: 'ProductFaqs',
  timestamps: true,
});

Product.hasMany(ProductFaq, { foreignKey: 'product_id', as: 'faqs' });
ProductFaq.belongsTo(Product, { foreignKey: 'product_id' });

module.exports = ProductFaq;
