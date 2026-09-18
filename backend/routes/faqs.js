const express = require('express');
const router = express.Router();
const {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus
} = require('../controllers/faqController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.route('/').get(getAllFaqs);
router.route('/:id').get(getFaqById);

// Admin routes
router.route('/').post(protect, adminOnly, createFaq);
router.route('/:id').put(protect, adminOnly, updateFaq);
router.route('/:id').delete(protect, adminOnly, deleteFaq);
router.route('/:id/toggle').patch(protect, adminOnly, toggleFaqStatus);

module.exports = router;
