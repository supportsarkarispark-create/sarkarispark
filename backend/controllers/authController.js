const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User, Media, Result, Payment, AdmitCard } = require('../models');
const { generateToken, generatePaymentToken } = require('../middleware/auth');
const { isUserPaid } = require('../utils/subscriptionHelper');
const { ErrorResponse } = require('../middleware/errorHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessages,
        errors: errors.array()
      });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // For regular users, require payment before allowing platform login
    if (user.role === 'user') {
      const paymentToken = generatePaymentToken(user._id, user.email);
      return res.status(201).json({
        success: true,
        requiresPayment: true,
        message: 'Account successfully create ho gaya hai! Portal me login karne ke liye kripya subscription plan chunein aur payment karein.',
        paymentToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          subscriptionType: user.subscriptionType,
          createdAt: user.createdAt
        }
      });
    }

    // Administrators get active session immediately
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionType: user.subscriptionType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if regular user has paid
    if (user.role === 'user') {
      const paid = await isUserPaid(user);
      if (!paid) {
        const paymentToken = generatePaymentToken(user._id, user.email);
        return res.status(403).json({
          success: false,
          requiresPayment: true,
          message: 'Payment kiye bina login nahi kiya ja sakta. Kripya pehle subscription plan kharidein.',
          paymentToken,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        });
      }
    }

    // Single active device session enforcement for user accounts
    let sessionId = null;
    if (user.role === 'user') {
      sessionId = crypto.randomUUID();
      user.currentSessionId = sessionId;
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token with sessionId
    const token = generateToken(user._id, sessionId);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
        avatar: user.avatar,
        profile: user.profile,
        stats: user.stats,
        weakTopics: user.weakTopics,
        strongTopics: user.strongTopics,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, education, city, state, targetExams, preferredLanguage, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If avatar is being set to empty string, delete from media and clear avatar
    if (avatar === "" && user.avatar) {
      try {
        await Media.deleteOne({ url: user.avatar });
      } catch (mediaError) {
        console.error('Error deleting media:', mediaError);
        // Continue even if media delete fails
      }
      user.avatar = "";
    } else if (avatar !== undefined && avatar !== user.avatar) {
      // Avatar is being changed to a new one
      if (user.avatar) {
        try {
          await Media.deleteOne({ url: user.avatar });
        } catch (mediaError) {
          console.error('Error deleting old media:', mediaError);
        }
      }
      user.avatar = avatar;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Initialize profile if it doesn't exist
    if (!user.profile) user.profile = {};
    
    if (education) user.profile.education = education;
    if (city) user.profile.city = city;
    if (state) user.profile.state = state;
    if (targetExams) user.profile.targetExams = targetExams;
    if (preferredLanguage) user.profile.preferredLanguage = preferredLanguage;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
        avatar: user.avatar,
        profile: user.profile,
        stats: user.stats,
        weakTopics: user.weakTopics,
        strongTopics: user.strongTopics,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Save the relative path to the database
    user.avatar = `/uploads/profiles/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: user.avatar,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        subscriptionType: user.subscriptionType,
        subscriptionExpiry: user.subscriptionExpiry,
        avatar: user.avatar,
        profile: user.profile,
        stats: user.stats,
        weakTopics: user.weakTopics,
        strongTopics: user.strongTopics,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    let sessionId = null;
    if (user.role === 'user') {
      sessionId = crypto.randomUUID();
      user.currentSessionId = sessionId;
    }
    await user.save();

    // Generate new token
    const token = generateToken(user._id, sessionId);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Send email with reset link
    // For now, just return success

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { currentSessionId: null });
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin' || user.role === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin accounts'
      });
    }

    // Delete user's avatar image from media library
    if (user.avatar) {
      await Media.deleteOne({ url: user.avatar });
    }

    // Delete all media files uploaded by this user
    await Media.deleteMany({ uploadedBy: user._id });

    // Cascade delete all related data
    await Result.deleteMany({ userId: user._id });
    await Payment.deleteMany({ userId: user._id });
    await AdmitCard.deleteMany({ userId: user._id });

    // Delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account and all related data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
