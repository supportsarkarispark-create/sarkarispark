const express = require('express');
const router = express.Router();
const { admitCardController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/search', admitCardController.searchAdmitCard);

// Protected routes
router.get('/', protect, admitCardController.getMyAdmitCards);

// Specific ID sub-routes (MUST be before /:id)
router.get('/:id/download', protect, admitCardController.downloadAdmitCard);
router.put('/:id/upload', protect, admitCardController.uploadDocuments);

// Generic ID route (MUST be last among ID routes)
router.get('/:id', protect, admitCardController.getAdmitCard);

// Admin only routes
router.put('/:id', protect, adminOnly, admitCardController.updateAdmitCard);
router.delete('/:id', protect, adminOnly, admitCardController.deleteAdmitCard);

module.exports = router;
