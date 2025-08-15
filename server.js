const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import database configuration
const sequelize = require('./config/db');

// Import models to register them
const User = require('./models/User');
const Vendor = require('./models/Vendor');
const Category = require('./models/Category');
const SubCategory = require('./models/SubCategory');

// Import routes
const vendorRoutes = require('./routes/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(helmet());
app.use(morgan('dev'));

// Allow React app to fetch images
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== STATIC FILE SETUP =====

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure public folder exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Serve images without authentication middleware
app.use('/uploads', express.static(uploadsDir, { setHeaders: setCorsHeaders }));
app.use('/uploads/vendors', express.static(path.join(__dirname, 'uploads/vendors'), { setHeaders: setCorsHeaders }));
app.use('/public', express.static(publicDir, { setHeaders: setCorsHeaders }));
app.use('/public/vendors', express.static(path.join(__dirname, 'public/vendors'), { setHeaders: setCorsHeaders }));

// Function to add CORS headers for static files
function setCorsHeaders(res, path, stat) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
}

// ===== ROUTES =====
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('🌐 Amaravathi Admin Backend with PostgreSQL is running successfully!');
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ===== START SERVER =====
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    const models = { User, Vendor, Category, SubCategory };
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// ===== GRACEFUL SHUTDOWN =====
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  sequelize.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});
