const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Category = require('../categories/category.model');
const Template = require('../templates/template.model');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  moq: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  turnaround_estimate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  og_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  canonical_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  homepage_tag: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  homepage_sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  show_in_home_scroll: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  home_scroll_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image_alt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Template,
      key: 'id'
    }
  }
}, {
  tableName: 'Products',
  paranoid: true, // soft deletes
  timestamps: true,
  hooks: {
    beforeValidate: async (product, options) => {
      if (product.name && !product.slug) {
        product.slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      if (product.slug) {
        let baseSlug = product.slug;
        let slug = baseSlug;
        let counter = 1;
        let existing = await sequelize.models.Product.findOne({ where: { slug }, paranoid: false, transaction: options.transaction });
        while (existing && existing.id !== product.id) {
          slug = `${baseSlug}-${counter}`;
          counter++;
          existing = await sequelize.models.Product.findOne({ where: { slug }, paranoid: false, transaction: options.transaction });
        }
        product.slug = slug;
      }
    }
  }
});

// Associations
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });
Product.belongsTo(Template, { foreignKey: 'templateId', as: 'Template', constraints: false });
Template.hasMany(Product, { foreignKey: 'templateId', constraints: false });

module.exports = Product;
