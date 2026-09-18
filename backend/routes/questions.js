const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { questionController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/subjects/:examId', questionController.getSubjects);
router.get('/topics/:examId', questionController.getTopics);

// Admin only routes
router.get('/exam/:examId', protect, adminOnly, questionController.getQuestions);
router.get('/:id', protect, adminOnly, questionController.getQuestion);

router.post('/', 
  protect, 
  adminOnly,
  [
    body('examId').notEmpty().withMessage('Exam ID is required'),
    body('question').trim().notEmpty().withMessage('Question text is required'),
    body('options').isArray({ min: 2, max: 6 }).withMessage('Options must be an array of 2-6 items'),
    body('correctAnswer').isInt({ min: 0, max: 5 }).withMessage('Correct answer must be a valid option index')
  ],
  questionController.createQuestion
);

router.post('/bulk', protect, adminOnly, (req, res, next) => {
  if (typeof questionController.createBulkQuestions === 'function') {
    return questionController.createBulkQuestions(req, res, next);
  }
  res.status(500).json({ success: false, message: 'Controller function not found' });
});
router.post('/import', protect, adminOnly, questionController.importQuestions);
router.put('/:id', protect, adminOnly, questionController.updateQuestion);
router.delete('/:id', protect, adminOnly, questionController.deleteQuestion);

module.exports = router;
