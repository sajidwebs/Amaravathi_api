const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const vendorsDir = path.join(uploadsDir, 'vendors');
const categoriesDir = path.join(uploadsDir, 'categories');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(vendorsDir)) {
  fs.mkdirSync(vendorsDir, { recursive: true });
}

if (!fs.existsSync(categoriesDir)) {
  fs.mkdirSync(categoriesDir, { recursive: true });
}

// Storage configuration for general uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const uniqueName = Date.now() + '-' + base + ext;
    cb(null, uniqueName);
  }
});

// Storage configuration for vendor uploads
const vendorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, vendorsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Storage configuration for category uploads
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, categoriesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `category-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true);
  const allowed = /jpeg|jpg|png/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only JPEG, JPG, and PNG images are allowed'));
};

// Multer instances
const upload = multer({ storage, fileFilter });
const vendorUpload = multer({ storage: vendorStorage, fileFilter });
const categoryUpload = multer({ storage: categoryStorage, fileFilter });

module.exports = {
  upload,
  vendorUpload,
  categoryUpload
};