const express = require('express');
const router = express.Router();
const { computerCourseResultController } = require('../controllers');
const { protect } = require('../middleware/auth');

router.get('/leaderboard/:examId', computerCourseResultController.getLeaderboard);
router.post('/', protect, computerCourseResultController.submitResult);
router.get('/my-results', protect, computerCourseResultController.getMyResults);
router.get('/check/:examId', protect, computerCourseResultController.checkCompletion);
router.get('/:id', protect, computerCourseResultController.getResult);

module.exports = router;
