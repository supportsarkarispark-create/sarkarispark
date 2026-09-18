const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');

// Dashboard & Analytics
router.get('/dashboard', protect, adminOnly, adminController.getDashboardStats);
router.get('/analytics', protect, adminOnly, adminController.getAnalytics);

// User management
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.put('/users/:id', protect, adminOnly, adminController.updateUser);
router.delete('/users/:id', protect, adminOnly, adminController.deleteUser);

// Payment management
router.get('/payments', protect, adminOnly, adminController.getAllPayments);

// Admit Card management
router.get('/admitcards', protect, adminOnly, adminController.getAllAdmitCards);
router.post('/admitcards', protect, adminOnly, adminController.generateAdmitCards);

module.exports = router;
