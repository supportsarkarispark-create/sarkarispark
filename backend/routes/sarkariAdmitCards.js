const express = require('express');
const router = express.Router();
const { sarkariAdmitCardController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', sarkariAdmitCardController.getAllSarkariAdmitCards);
router.get('/latest', sarkariAdmitCardController.getAllSarkariAdmitCards); // with ?latest=true
router.get('/:id', sarkariAdmitCardController.getSarkariAdmitCard);

// Admin only routes
router.post('/', protect, adminOnly, sarkariAdmitCardController.createSarkariAdmitCard);
router.put('/:id', protect, adminOnly, sarkariAdmitCardController.updateSarkariAdmitCard);
router.delete('/:id', protect, adminOnly, sarkariAdmitCardController.deleteSarkariAdmitCard);
router.get('/admin/all', protect, adminOnly, sarkariAdmitCardController.getAllSarkariAdmitCardsAdmin);
router.patch('/:id/latest', protect, adminOnly, sarkariAdmitCardController.toggleLatest);
router.patch('/:id/active', protect, adminOnly, sarkariAdmitCardController.toggleActive);

module.exports = router;
