const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const BlogPost = sequelize.define('BlogPost', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true, // Rich text
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meta_description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'BlogPosts',
  paranoid: true, // soft deletes
  timestamps: true,
});

module.exports = BlogPost;
