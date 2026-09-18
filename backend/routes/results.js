const express = require('express');
const router = express.Router();
const { resultController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes (must be before parameterized routes)
router.get('/admin/all', protect, adminOnly, resultController.getAllResults);
router.get('/admin/stats', protect, adminOnly, resultController.getResultStats);
router.delete('/admin/:id', protect, adminOnly, resultController.deleteResult);

// Protected routes
router.post('/', protect, resultController.submitResult);
router.get('/', protect, resultController.getMyResults);
router.get('/analytics', protect, resultController.getAnalytics);
router.get('/search', resultController.searchResult);
router.get('/leaderboard/:examId', resultController.getLeaderboard);

// Single result route (must be last)
router.get('/:id', protect, resultController.getResult);

module.exports = router;
