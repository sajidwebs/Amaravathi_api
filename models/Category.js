const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  profile: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

// Define associations
Category.associate = function(models) {
  Category.hasMany(models.SubCategory, {
    foreignKey: 'categoryId',
    as: 'subCategories'
  });
};

module.exports = Category;