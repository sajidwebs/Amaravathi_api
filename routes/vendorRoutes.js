const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');
const { vendorUpload } = require('../config/multerConfig');

const uploadSingle = (req, res, next) => {
  vendorUpload.single('profileImage')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Routes
router.get('/', vendorController.getVendors);
router.post('/', uploadSingle, vendorController.addVendor);
router.post('/login', vendorController.loginVendor);

router.get('/me', authMiddleware, vendorController.getCurrentVendor);
router.put('/:id', authMiddleware, uploadSingle, vendorController.updateVendor);
router.delete('/:id', authMiddleware, vendorController.deleteVendor);

module.exports = router;