const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { examController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', examController.getExams);
router.get('/categories', examController.getCategories);

// Admin only routes - MUST be before /:id route
router.get('/computer', protect, adminOnly, examController.getComputerExams);

// Public single exam route (must be last among specific routes)
router.get('/:id', examController.getExam);
router.get('/:id/tests', examController.getExamTests);

// Protected routes (need authentication)
router.get('/:id/questions', protect, examController.getExamQuestions);
router.post('/:id/rate', protect, examController.rateExam);

router.post('/', 
  protect, 
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    body('totalQuestions').isNumeric().withMessage('Total questions must be a number'),
    body('totalMarks').isNumeric().withMessage('Total marks must be a number')
  ],
  examController.createExam
);

router.put('/:id', protect, adminOnly, examController.updateExam);
router.delete('/:id', protect, adminOnly, examController.deleteExam);

module.exports = router;
