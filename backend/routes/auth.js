const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadAvatar } = require('../middleware/upload');
const { User } = require('../models');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Please provide a password')
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), authController.uploadAvatar);
router.put('/password', protect, authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/logout', protect, authController.logout);
router.delete('/account', protect, authController.deleteAccount);

// @route   POST /api/auth/make-admin
// @desc    Make a user an admin (for development only)
// @access  Public (for easy setup)
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.role = 'admin';
    await user.save();
    
    res.json({
      success: true,
      message: `User ${email} is now an admin`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
