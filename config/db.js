// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Prefer DATABASE_URL (Render sets this automatically if you attach a DB).
const connectionString = process.env.DATABASE_URL || (
  process.env.DB_HOST && `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`
);

// options
const options = {
  dialect: 'postgres',
  logging: false,
  // tune pool if needed
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// if in production enable SSL options (Render requires TLS)
if (process.env.NODE_ENV === 'production' || process.env.USE_SSL === 'true') {
  options.dialectOptions = {
    ssl: {
      require: true,
      // Render uses a trusted cert, but setting rejectUnauthorized:false avoids issues with some client setups
      rejectUnauthorized: false
    }
  };
}

if (!connectionString) {
  throw new Error('Database connection string is not set. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.');
}

const sequelize = new Sequelize(connectionString, options);

module.exports = sequelize;
