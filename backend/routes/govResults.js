const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { govResultController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gov-result-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Admin routes (must be before parameterized routes)
router.get('/admin/all', protect, adminOnly, govResultController.getAllGovResultsAdmin);

// Public routes
router.get('/', govResultController.getGovResults);

// Admin protected routes
router.post('/', protect, adminOnly, upload.single('image'), govResultController.createGovResult);

// Specific ID sub-routes (MUST be before /:id)
router.put('/:id/toggle-latest', protect, adminOnly, govResultController.toggleLatest);

// Generic ID routes
router.get('/:id', govResultController.getGovResult);
router.put('/:id', protect, adminOnly, upload.single('image'), govResultController.updateGovResult);
router.delete('/:id', protect, adminOnly, govResultController.deleteGovResult);

module.exports = router;
