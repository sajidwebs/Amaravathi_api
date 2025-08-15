const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const { categoryUpload } = require('../config/multerConfig');

const uploadCategoryImage = (req, res, next) => {
  categoryUpload.single('profile')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Category routes
router.post('/categories', authMiddleware, uploadCategoryImage, adminController.addCategory);
router.get('/categories', adminController.getCategories);
router.put('/categories/:id', authMiddleware, uploadCategoryImage, adminController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminController.deleteCategory);

// SubCategory routes
router.post('/subcategories', authMiddleware, uploadCategoryImage, adminController.addSubCategory);
router.get('/subcategories', adminController.getSubCategories);
router.put('/subcategories/:id', authMiddleware, uploadCategoryImage, adminController.updateSubCategory);
router.delete('/subcategories/:id', authMiddleware, adminController.deleteSubCategory);

module.exports = router;