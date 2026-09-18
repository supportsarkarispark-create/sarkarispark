const express = require('express');
const router = express.Router();
const { couponController } = require('../controllers');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/public', couponController.getPublicCoupons);
router.post('/validate', optionalAuth, couponController.validateCoupon);
router.post('/apply', protect, couponController.applyCoupon);

// Admin routes
router
  .route('/')
  .get(protect, adminOnly, couponController.getCoupons)
  .post(protect, adminOnly, couponController.createCoupon);

router
  .route('/:id')
  .get(protect, adminOnly, couponController.getCoupon)
  .put(protect, adminOnly, couponController.updateCoupon)
  .delete(protect, adminOnly, couponController.deleteCoupon);

module.exports = router;
