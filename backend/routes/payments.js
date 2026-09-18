const express = require('express');
const router = express.Router();
const { paymentController } = require('../controllers');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/plans', paymentController.getPlans);

// Protected routes
router.get('/', protect, paymentController.getMyPayments);
router.get('/subscription-status', protect, paymentController.getSubscriptionStatus);
router.get('/check-exam-access/:examId', protect, paymentController.checkExamAccess);
router.get('/:id', protect, paymentController.getPayment);
router.post('/order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);

// Webhook (public but with signature verification)
router.post('/webhook', paymentController.webhook);

module.exports = router;
