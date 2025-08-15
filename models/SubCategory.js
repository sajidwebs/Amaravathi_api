const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SubCategory = sequelize.define('SubCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  },
  profile: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

// Define associations
SubCategory.associate = function(models) {
  SubCategory.belongsTo(models.Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
};

module.exports = SubCategory;