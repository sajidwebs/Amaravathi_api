const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Try to find vendor first, then user
    let vendor = await Vendor.findByPk(decoded.id);
    if (vendor) {
      req.vendor = vendor;
      return next();
    }
    
    // If not vendor, try user
    let user = await User.findByPk(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }
    
    return res.status(404).json({ success: false, message: 'User or vendor not found' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

module.exports = authMiddleware;