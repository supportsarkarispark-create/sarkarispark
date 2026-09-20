const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Payment, User, Exam, Coupon, Settings } = require('../models');
const { generateToken } = require('../middleware/auth');

// Debug: Check if environment variables are loaded
console.log('[DEBUG] Razorpay Environment Variables:');
console.log('[DEBUG] RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'NOT SET');
console.log('[DEBUG] RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'NOT SET');

// Initialize Razorpay with safe fallbacks and force LIVE mode
const getRazorpay = () => {
  let key_id = process.env.RAZORPAY_KEY_ID;
  let key_secret = process.env.RAZORPAY_KEY_SECRET;

  // If key is missing or is set to old test key in dashboard environment variables, override with LIVE keys
  if (!key_id || key_id.startsWith('rzp_test_') || key_id.includes('test')) {
    key_id = 'rzp_live_TeEhKi4wCZxUnV';
    key_secret = '0TKafOi6GFkC2rMLg75BCY1R';
  }
  return new Razorpay({ key_id, key_secret });
};

let razorpay;
try {
  razorpay = getRazorpay();
  console.log('[DEBUG] Razorpay initialized successfully');
} catch (e) {
  console.warn('[WARN] Razorpay initialization warning:', e.message);
}

// @desc    Create order for subscription
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { planType, duration, selectedExams, couponCode } = req.body;
    const userId = req.user.id;

    console.log('[DEBUG] Create order request:', { planType, duration, selectedExams, couponCode, userId });
    console.log('[DEBUG] Razorpay credentials:', {
      key_id: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
      key_secret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
    });

    let amount;
    let description;
    let planDetails;
    let durationMonths = 0;
    let discountAmount = 0;
    let appliedCoupon = null;

    // Load pricing from settings
    const settings = await Settings.findOne();
    const pricing = settings?.subscriptionPricing;

    console.log('[DEBUG] Settings found:', !!settings);
    console.log('[DEBUG] Pricing found:', !!pricing);

    if (!pricing) {
      console.error('[ERROR] Pricing configuration not found in settings');
      return res.status(500).json({
        success: false,
        message: 'Pricing configuration not found. Please contact admin.'
      });
    }

    // Calculate duration in months
    if (duration === 'monthly') durationMonths = 1;
    else if (duration === 'sixMonths') durationMonths = 6;
    else if (duration === 'yearly') durationMonths = 12;

    // Calculate amount based on plan type
    if (planType === 'singleExam') {
      if (!selectedExams || selectedExams.length !== 1) {
        return res.status(400).json({
          success: false,
          message: 'Please select exactly 1 exam for Single Exam plan'
        });
      }
      const planData = pricing.singleExam[duration];
      if (!planData || !planData.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This plan is not available'
        });
      }
      amount = (planData.discountPrice || planData.price) * 100;
      description = `Single Exam Access (${duration})`;
      planDetails = { planType, duration, examCount: 1 };
    } else if (planType === 'customSelection') {
      if (!selectedExams || selectedExams.length < pricing.customSelection[duration].minExams) {
        return res.status(400).json({
          success: false,
          message: `Please select at least ${pricing.customSelection[duration].minExams} exams`
        });
      }
      if (selectedExams.length > pricing.customSelection[duration].maxExams) {
        return res.status(400).json({
          success: false,
          message: `You can select maximum ${pricing.customSelection[duration].maxExams} exams`
        });
      }
      const planData = pricing.customSelection[duration];
      if (!planData || !planData.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This plan is not available'
        });
      }
      amount = (planData.discountPrice || planData.pricePerExam) * selectedExams.length * 100;
      description = `Custom Selection: ${selectedExams.length} exams (${duration})`;
      planDetails = { planType, duration, examCount: selectedExams.length, selectedExams };
    } else if (planType === 'allExams') {
      const planData = pricing.allExams[duration];
      if (!planData || !planData.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This plan is not available'
        });
      }
      amount = (planData.discountPrice || planData.price) * 100;
      description = `All Exams Access (${duration})`;
      planDetails = { planType, duration };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true
      });

      if (coupon) {
        // Check if coupon is valid
        const now = new Date();
        if (coupon.validFrom && now < coupon.validFrom) {
          return res.status(400).json({
            success: false,
            message: 'Coupon is not yet valid'
          });
        }

        if (coupon.validUntil && now > coupon.validUntil) {
          return res.status(400).json({
            success: false,
            message: 'Coupon has expired'
          });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({
            success: false,
            message: 'Coupon usage limit exceeded'
          });
        }

        // Check user limit
        const userUsageCount = coupon.usedBy.filter(id => id.toString() === userId).length;
        if (userUsageCount >= coupon.userLimit) {
          return res.status(400).json({
            success: false,
            message: 'You have already used this coupon'
          });
        }

        // Check minimum purchase amount
        const amountInRupees = amount / 100;
        if (coupon.minPurchaseAmount && amountInRupees < coupon.minPurchaseAmount) {
          return res.status(400).json({
            success: false,
            message: `Minimum purchase amount ₹${coupon.minPurchaseAmount} required`
          });
        }

        // Check applicability
        if (coupon.applicableOn !== 'all' && coupon.applicableOn !== planType) {
          return res.status(400).json({
            success: false,
            message: `This coupon is only applicable for ${coupon.applicableOn === 'singleExam' ? 'Single Exam' : coupon.applicableOn === 'customSelection' ? 'Custom Selection' : 'All Exams'} plans`
          });
        }

        // Calculate discount
        if (coupon.discountType === 'percentage') {
          discountAmount = (amountInRupees * coupon.discountValue) / 100;
          // Apply max discount limit if set
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        // Ensure discount doesn't exceed amount
        if (discountAmount > amountInRupees) {
          discountAmount = amountInRupees;
        }

        // Update amount with discount
        amount = Math.round((amountInRupees - discountAmount) * 100);
        appliedCoupon = coupon.code;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Invalid coupon code'
        });
      }
    }

    // If amount is 0 (100% discount coupon applied or free order), activate subscription immediately without payment gateway
    if (amount <= 0) {
      console.log('[DEBUG] Free / 100% discount coupon order detected for user:', userId);
      const freeOrderId = `order_free_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const freePaymentId = `pay_free_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      // Calculate access end date based on duration
      let accessEndDate = new Date();
      if (durationMonths > 0) {
        accessEndDate.setMonth(accessEndDate.getMonth() + durationMonths);
      } else {
        accessEndDate.setFullYear(accessEndDate.getFullYear() + 10);
      }

      // Create completed payment record
      const payment = await Payment.create({
        userId,
        orderId: freeOrderId,
        paymentId: freePaymentId,
        amount: 0,
        currency: 'INR',
        planType,
        planDetails,
        description: `${description} (100% Free - Coupon ${appliedCoupon || 'Discount'})`,
        examId: planType === 'singleExam' ? selectedExams[0] : null,
        finalAmount: 0,
        status: 'completed',
        completedAt: new Date(),
        paymentMethod: 'coupon',
        examAccess: {
          examIds: planType === 'allExams' ? [] : (selectedExams || []),
          accessType: planType,
          durationMonths: durationMonths,
          accessStartDate: new Date(),
          accessEndDate: accessEndDate
        },
        couponCode: appliedCoupon,
        discountAmount: discountAmount || 0
      });

      // Update user subscription to active paid status
      const sessionId = crypto.randomUUID();
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscriptionType: planType || 'allExams',
          subscriptionExpiry: accessEndDate,
          currentSessionId: sessionId,
          lastLogin: Date.now()
        },
        { new: true }
      );

      // Generate active session JWT token
      const token = generateToken(updatedUser._id, sessionId);

      // Update coupon usage if coupon was applied
      if (appliedCoupon) {
        await Coupon.findOneAndUpdate(
          { code: appliedCoupon },
          {
            $inc: { usedCount: 1 },
            $push: { usedBy: userId }
          }
        );
      }

      return res.status(200).json({
        success: true,
        isFree: true,
        message: '100% Discount applied! Your Pro subscription has been activated for FREE!',
        token,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          subscriptionType: updatedUser.subscriptionType,
          subscriptionExpiry: updatedUser.subscriptionExpiry
        },
        payment: {
          id: payment._id,
          orderId: payment.orderId,
          amount: 0,
          status: 'completed',
          planType: payment.planType
        }
      });
    }

    // Create Razorpay order
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        planType,
        duration,
        selectedExams: selectedExams || [],
        durationMonths: durationMonths.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    console.log('[DEBUG] Razorpay order created:', order.id);

    // Save order in database
    const payment = await Payment.create({
      userId,
      orderId: order.id,
      amount: order.amount / 100, // Convert to rupees
      currency: order.currency,
      planType,
      planDetails,
      description,
      examId: planType === 'singleExam' ? selectedExams[0] : null,
      finalAmount: order.amount / 100,
      status: 'pending',
      examAccess: {
        examIds: planType === 'allExams' ? [] : (selectedExams || []),
        accessType: planType,
        durationMonths: durationMonths
      },
      couponCode: appliedCoupon,
      discountAmount: discountAmount
    });

    console.log('[DEBUG] Payment record created:', payment._id);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_'))
          ? 'rzp_live_TeEhKi4wCZxUnV'
          : process.env.RAZORPAY_KEY_ID
      },
      payment: {
        id: payment._id,
        amount: payment.amount,
        description: payment.description
      }
    });
  } catch (error) {
    console.error('[ERROR] Create order error:', error);
    console.error('[ERROR] Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    let secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || secret === '0cq2mzTFguSP77G18wl6Qhfs' || process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_')) {
      secret = '0TKafOi6GFkC2rMLg75BCY1R';
    }
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { 
          status: 'failed',
          failedAt: new Date()
        }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'completed',
        completedAt: new Date(),
        metadata: {
          razorpayResponse: req.body
        }
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Calculate exam access end date based on duration
    let accessEndDate = new Date();
    const durationMonths = payment.examAccess?.durationMonths || (payment.planDetails?.duration === 'yearly' ? 12 : payment.planDetails?.duration === 'sixMonths' ? 6 : 1);
    
    if (durationMonths > 0) {
      accessEndDate.setMonth(accessEndDate.getMonth() + durationMonths);
    } else {
      // Lifetime access
      accessEndDate.setFullYear(accessEndDate.getFullYear() + 10);
    }

    await Payment.findByIdAndUpdate(payment._id, {
      'examAccess.accessStartDate': new Date(),
      'examAccess.accessEndDate': accessEndDate
    });

    // Update user subscription to active paid status and generate a new single-device session
    const sessionId = crypto.randomUUID();
    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        subscriptionType: payment.planType || 'allExams',
        subscriptionExpiry: accessEndDate,
        currentSessionId: sessionId,
        lastLogin: Date.now()
      },
      { new: true }
    );

    // Generate FULL active session JWT token for the user so they are immediately logged in
    const token = generateToken(updatedUser._id, sessionId);

    // Update coupon usage if coupon was applied
    if (payment.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: payment.couponCode },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: payment.userId }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and account activated successfully!',
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        subscriptionType: updatedUser.subscriptionType,
        subscriptionExpiry: updatedUser.subscriptionExpiry
      },
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        status: payment.status,
        planType: payment.planType
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's payments
// @route   GET /api/payments
// @access  Private
exports.getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      payments: payments.map(p => ({
        id: p._id,
        orderId: p.orderId,
        paymentId: p.paymentId,
        amount: p.amount,
        planType: p.planType,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
        completedAt: p.completedAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment belongs to user or user is admin
    if (payment.userId.toString() !== req.user.id && req.user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription plans
// @route   GET /api/payments/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
  try {
    const plans = {
      monthly: {
        id: 'monthly',
        name: 'Monthly Premium',
        price: 299,
        duration: '1 Month',
        features: [
          'Access to all premium exams',
          'Unlimited mock tests',
          'Detailed performance analytics',
          'Ad-free experience',
          'PDF downloads',
          'Email support'
        ],
        popular: false
      },
      yearly: {
        id: 'yearly',
        name: 'Yearly Premium',
        price: 1999,
        originalPrice: 3588,
        duration: '1 Year',
        features: [
          'All Monthly features',
          '2 months FREE',
          'Priority email support',
          'Exclusive study materials',
          'One-on-one doubt clearing',
          'Early access to new exams'
        ],
        popular: true
      }
    };

    res.status(200).json({
      success: true,
      plans
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check subscription status
// @route   GET /api/payments/subscription-status
// @access  Private
exports.getSubscriptionStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    let status = 'free';
    let isActive = false;
    let expiryDate = null;
    let daysLeft = 0;

    if (user.subscriptionType !== 'free' && user.subscriptionExpiry) {
      const now = new Date();
      if (user.subscriptionExpiry > now) {
        status = user.subscriptionType;
        isActive = true;
        expiryDate = user.subscriptionExpiry;
        daysLeft = Math.ceil((user.subscriptionExpiry - now) / (1000 * 60 * 60 * 24));
      }
    }

    res.status(200).json({
      success: true,
      subscription: {
        status,
        isActive,
        type: user.subscriptionType,
        expiryDate,
        daysLeft
      }
    });
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Razorpay events
exports.webhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest) {
      const event = req.body;

      // Handle payment captured event
      if (event.event === 'payment.captured') {
        const { order_id, id } = event.payload.payment.entity;

        await Payment.findOneAndUpdate(
          { orderId: order_id },
          {
            paymentId: id,
            status: 'completed',
            completedAt: new Date()
          }
        );
      }

      res.json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'invalid signature' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error' });
  }
};

// @desc    Check if user has access to a specific exam
// @route   GET /api/payments/check-exam-access/:examId
// @access  Private
exports.checkExamAccess = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const userId = req.user.id;

    // Check if user has a valid payment for this exam
    const payment = await Payment.findOne({
      userId,
      'examAccess.examId': examId,
      status: 'completed'
    });

    if (!payment) {
      return res.status(200).json({
        success: true,
        hasAccess: false,
        message: 'No payment found for this exam'
      });
    }

    // Check if access is still valid
    const now = new Date();
    const accessEndDate = payment.examAccess?.accessEndDate;

    if (!accessEndDate || now > accessEndDate) {
      return res.status(200).json({
        success: true,
        hasAccess: false,
        message: 'Access has expired'
      });
    }

    // User has valid access
    res.status(200).json({
      success: true,
      hasAccess: true,
      accessDetails: {
        examId: payment.examAccess.examId,
        accessStartDate: payment.examAccess.accessStartDate,
        accessEndDate: payment.examAccess.accessEndDate,
        durationMonths: payment.examAccess.durationMonths,
        daysRemaining: Math.ceil((accessEndDate - now) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    next(error);
  }
};
