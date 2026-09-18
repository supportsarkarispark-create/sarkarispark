const { Coupon, User, Exam } = require('../models');

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      applicableOn,
      applicableExamIds,
      usageLimit,
      userLimit,
      validFrom,
      validUntil
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minPurchaseAmount,
      applicableOn,
      applicableExamIds,
      usageLimit,
      userLimit,
      validFrom,
      validUntil,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name')
      .populate('applicableExamIds', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('applicableExamIds', 'title');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // If code is being updated, check if it already exists
    if (req.body.code && req.body.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      req.body.code = req.body.code.toUpperCase();
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    if (updateData.createdBy && typeof updateData.createdBy === 'object') {
      updateData.createdBy = updateData.createdBy._id || updateData.createdBy.id;
    }

    coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Soft delete - set isActive to false
    coupon.isActive = false;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public / Optional Auth
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, amount, planType, examId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is expired
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

    // Check user limit if user is authenticated
    if (userId && Array.isArray(coupon.usedBy)) {
      const userUsageCount = coupon.usedBy.filter(id => id && id.toString() === userId.toString()).length;
      if (userUsageCount >= coupon.userLimit) {
        return res.status(400).json({
          success: false,
          message: 'You have already used this coupon'
        });
      }
    }

    // Check minimum purchase amount
    if (coupon.minPurchaseAmount && amount < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount ₹${coupon.minPurchaseAmount} required`
      });
    }

    // Check applicability
    if (coupon.applicableOn && coupon.applicableOn !== 'all' && coupon.applicableOn !== planType) {
      const planNames = {
        singleExam: 'Single Exam Pass',
        customSelection: 'Custom Combo Pass',
        allExams: 'All Exams Pro Pass'
      };
      return res.status(400).json({
        success: false,
        message: `This coupon is only applicable for ${planNames[coupon.applicableOn] || coupon.applicableOn}`
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discountValue) / 100;
      // Apply max discount limit if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed amount
    if (discountAmount > amount) {
      discountAmount = amount;
    }

    const finalAmount = amount - discountAmount;

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        applicableOn: coupon.applicableOn,
        discountAmount,
        finalAmount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon (update usage)
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Update usage count
    coupon.usedCount += 1;
    
    // Add user to usedBy if not already present
    if (!coupon.usedBy.includes(userId)) {
      coupon.usedBy.push(userId);
    }

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active public coupons
// @route   GET /api/coupons/public
// @access  Public
exports.getPublicCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: null },
        { validUntil: { $gte: now } }
      ]
    })
      .select('code description discountType discountValue maxDiscount minPurchaseAmount applicableOn validUntil')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    next(error);
  }
};
