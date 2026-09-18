const jwt = require('jsonwebtoken');
const { User, Payment } = require('../models');
const { isUserPaid } = require('../utils/subscriptionHelper');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('[DEBUG] Auth middleware - token exists:', !!token);

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      console.log('[DEBUG] Verifying token with JWT_SECRET:', process.env.JWT_SECRET ? 'exists' : 'MISSING');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[DEBUG] Token decoded, user id:', decoded.id);

      // Find user by id
      const user = await User.findById(decoded.id);
      console.log('[DEBUG] User found:', !!user);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      // Payment-only token check (used during pre-login payment flow)
      const isPaymentRoute =
        req.baseUrl?.includes('/payments') ||
        req.path?.includes('/payments') ||
        req.originalUrl?.includes('/payments') ||
        req.baseUrl?.includes('/coupons') ||
        req.path?.includes('/coupons') ||
        req.originalUrl?.includes('/coupons');

      if (decoded.scope === 'payment_only') {
        if (!isPaymentRoute && !req.originalUrl?.includes('/auth/me')) {
          return res.status(403).json({
            success: false,
            requiresPayment: true,
            message: 'Payment kiye bina login ya content access nahi kiya ja sakta. Kripya pehle payment karein.'
          });
        }
        req.user = user;
        req.isPaymentOnlyToken = true;
        return next();
      }

      // Single active device enforcement for regular user accounts
      if (user.role === 'user') {
        if (user.currentSessionId && (!decoded.sessionId || decoded.sessionId !== user.currentSessionId)) {
          return res.status(401).json({
            success: false,
            sessionExpired: true,
            message: 'Aapka account kisi doosre device par login ho gaya hai. Suraksha ke liye is device se logout kar diya gaya hai.'
          });
        }

        // Mandatory payment check for regular users
        const paid = await isUserPaid(user);
        if (!paid && !isPaymentRoute) {
          return res.status(403).json({
            success: false,
            requiresPayment: true,
            message: 'Payment kiye bina login ya access nahi kiya ja sakta. Kripya pehle payment karein.'
          });
        }
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Optional auth middleware - passes req.user if valid token present, doesn't block if missing
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token verification errors for optional auth
    }
    next();
  } catch (error) {
    next();
  }
};

// Check if user is admin
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized. Admin access required.'
    });
  }
  next();
};

// Check if user is superadmin
exports.superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized. Super Admin access required.'
    });
  }
  next();
};

// Check if user has active subscription based on payment records
exports.requireSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user has any active payment with valid access
    const activePayment = await Payment.findOne({
      userId: user._id,
      status: 'completed',
      'examAccess.accessEndDate': { $gt: new Date() }
    });

    if (!activePayment) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this content. Please purchase a plan.'
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Error checking subscription status:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

// Check if user has access to specific exam
exports.checkExamAccess = async (req, res, next) => {
  try {
    const user = req.user;
    const examId = req.params.id || req.body.examId;

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID is required'
      });
    }

    // Check if user has active payment with access to this exam
    const activePayment = await Payment.findOne({
      userId: user._id,
      status: 'completed',
      'examAccess.accessEndDate': { $gt: new Date() },
      $or: [
        // All exams access
        { planType: 'allExams' },
        // Single exam access
        { planType: 'singleExam', 'examAccess.examIds': examId },
        // Custom selection includes this exam
        { planType: 'customSelection', 'examAccess.examIds': examId },
        // Monthly/yearly plans (all exams)
        { planType: { $in: ['monthly', 'yearly'] } }
      ]
    });

    if (!activePayment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this exam. Please purchase a plan.'
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Error checking exam access:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking exam access'
    });
  }
};

// Optional authentication - sets req.user if token exists but doesn't require it
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by id
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        // If regular user has a different session on another device, skip attaching user
        if (user.role === 'user' && user.currentSessionId && (!decoded.sessionId || decoded.sessionId !== user.currentSessionId)) {
          return next();
        }
        // Attach user to request
        req.user = user;
      }
      next();
    } catch (error) {
      // Invalid token, continue without user
      next();
    }
  } catch (error) {
    next();
  }
};

// Generate JWT token (with optional sessionId for single-device restriction)
exports.generateToken = (id, sessionId = null) => {
  const payload = { id };
  if (sessionId) {
    payload.sessionId = sessionId;
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Generate temporary payment-only token (for pre-login payment processing)
exports.generatePaymentToken = (id, email) => {
  return jwt.sign(
    { id, email, scope: 'payment_only' },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};
