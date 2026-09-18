const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { examCategoryController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', examCategoryController.getCategories);
router.get('/:id', examCategoryController.getCategory);

// Admin routes
router.get('/admin/all', protect, adminOnly, examCategoryController.getAllCategoriesAdmin);

router.post('/',
  protect,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim()
  ],
  examCategoryController.createCategory
);

router.put('/:id', protect, adminOnly, examCategoryController.updateCategory);
router.delete('/:id', protect, adminOnly, examCategoryController.deleteCategory);
router.patch('/:id/toggle', protect, adminOnly, examCategoryController.toggleCategoryStatus);

// Category courses routes
router.get('/:id/courses', examCategoryController.getCategoryCourses);
router.post('/:id/courses',
  protect,
  adminOnly,
  upload.single('courseImage'),
  handleUploadError,
  examCategoryController.createCategoryCourse
);
router.put('/courses/:courseId',
  protect,
  adminOnly,
  upload.single('courseImage'),
  handleUploadError,
  examCategoryController.updateCategoryCourse
);
router.delete('/courses/:courseId', protect, adminOnly, examCategoryController.deleteCategoryCourse);

module.exports = router;
