const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id',
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  homepage_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  show_on_homepage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  homepage_sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'Categories',
  paranoid: true, // soft deletes
  timestamps: true,
  hooks: {
    beforeDestroy: async (category, options) => {
      const Product = sequelize.models.Product;
      if (Product) {
        await Product.destroy({
          where: { category_id: category.id },
          transaction: options.transaction
        });
      }
    }
  }
});

module.exports = Category;
