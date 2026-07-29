const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 5,
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'Testimonials',
  timestamps: true,
});

module.exports = Testimonial;
