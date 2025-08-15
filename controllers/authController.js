const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Signup route
exports.signup = async (req, res) => {
  try {
    const { first_name, email_id, password, mobile_number } = req.body;

    // Validate required fields
    if (!first_name || !email_id || !password || !mobile_number) {
      return res.status(400).json({ message: 'Name, Email, Phone, and Password are required' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ where: { email: email_id } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      first_name,
      email: email_id,
      password: hashedPassword,
      mobile_number,
      profileImage: req.file ? req.file.filename : '',
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login route
exports.login = async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password) {
      return res.status(400).json({ message: 'Email and Password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email: email_id } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Prepare JWT payload
    const payload = {
      userId: user.id,
      email: user.email,
      first_name: user.first_name,
    };

    // Sign JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Return token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        first_name: user.first_name,
        email: user.email,
        mobile_number: user.mobile_number,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Protected route: get logged-in user details
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
