const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { studyMaterialController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes
router.get('/course/:courseId', studyMaterialController.getCourseMaterials);
router.get('/:id', studyMaterialController.getMaterial);
router.patch('/:id/download', studyMaterialController.incrementDownload);

// Admin routes
router.get('/admin/all', protect, adminOnly, studyMaterialController.getAllMaterialsAdmin);

router.post('/',
  protect,
  adminOnly,
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('courseId').trim().notEmpty().withMessage('Course ID is required'),
    body('type').trim().notEmpty().withMessage('Type is required')
  ],
  studyMaterialController.createMaterial
);

router.put('/:id',
  protect,
  adminOnly,
  upload.single('file'),
  studyMaterialController.updateMaterial
);

router.delete('/:id', protect, adminOnly, studyMaterialController.deleteMaterial);
router.patch('/:id/toggle', protect, adminOnly, studyMaterialController.toggleMaterialStatus);

module.exports = router;
