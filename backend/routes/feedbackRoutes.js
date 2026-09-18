const express = require('express');
const router = express.Router();
const {
  getApprovedFeedback,
  getAllFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  toggleApproval,
  toggleFeatured
} = require('../controllers/feedbackController');

// Public routes
router.route('/').get(getApprovedFeedback).post(createFeedback);

// Admin routes (temporarily without auth for testing)
router.route('/admin').get(getAllFeedback);
router.route('/:id')
  .put(updateFeedback)
  .delete(deleteFeedback);
router.patch('/:id/approve', toggleApproval);
router.patch('/:id/feature', toggleFeatured);

module.exports = router;
