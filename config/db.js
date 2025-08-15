const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance
const sequelize = new Sequelize('amaravathidb', 'postgres', 'j6JLsQKnjjY3ahX8RK7IwfmM9rnFLs1J', {
  host: 'dpg-d2fdbr6mcj7s73eme5kg-a',
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
});

module.exports = sequelize;