const express = require('express');
const router = express.Router();
const { sarkariWorkController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Admin routes (must be before parameterized routes)
router.get('/admin/all', protect, adminOnly, sarkariWorkController.getAllSarkariWorksAdmin);

// Public routes
router.get('/', sarkariWorkController.getSarkariWorks);
router.get('/:id', sarkariWorkController.getSarkariWork);

// Admin protected routes
router.post('/', protect, adminOnly, sarkariWorkController.createSarkariWork);
router.put('/:id', protect, adminOnly, sarkariWorkController.updateSarkariWork);
router.delete('/:id', protect, adminOnly, sarkariWorkController.deleteSarkariWork);

module.exports = router;
