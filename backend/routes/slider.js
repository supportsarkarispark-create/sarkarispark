const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sliderController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image and video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'slider-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Admin route (must be before parameterized routes)
router.get('/admin/all', protect, adminOnly, sliderController.getAllSlidersAdmin);

// Public routes
router.get('/', sliderController.getSliders);
router.get('/resolve-image', sliderController.resolveImage);

// Custom multer handler that accepts optional files (image and video)
const optionalUpload = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]);
  uploadFields(req, res, (err) => {
    // Ignore error if no file was uploaded (that's expected for URL-only)
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next();
    }
    if (err) {
      return next(err);
    }
    next();
  });
};

// Admin protected routes
router.post('/', protect, adminOnly, optionalUpload, sliderController.createSlider);
router.put('/:id', protect, adminOnly, optionalUpload, sliderController.updateSlider);
router.delete('/:id', protect, adminOnly, sliderController.deleteSlider);

// Single slider route (must be last)
router.get('/:id', sliderController.getSlider);

module.exports = router;
