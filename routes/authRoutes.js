const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { upload } = require('../config/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');

// Multer configuration for file uploads
const uploadSingle = (req, res, next) => {
  upload.single('profileImage')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Signup route
router.post('/signup', uploadSingle, authController.signup);

// Login route
router.post('/login', authController.login);

// Protected route: get logged-in user details
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;