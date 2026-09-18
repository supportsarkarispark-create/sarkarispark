const { User, Exam, Question, Result, Payment, AdmitCard, Media } = require('../models');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const premiumUsers = await User.countDocuments({
      subscriptionType: { $in: ['monthly', 'yearly'] }
    });

    // Exam stats
    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ isActive: true });
    const premiumExams = await Exam.countDocuments({ isPremium: true });

    // Question stats
    const totalQuestions = await Question.countDocuments();
    const activeQuestions = await Question.countDocuments({ isActive: true });

    // Result stats
    const totalAttempts = await Result.countDocuments({ isCompleted: true });
    const attemptsToday = await Result.countDocuments({
      submittedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      isCompleted: true
    });

    // Payment stats
    const totalPayments = await Payment.countDocuments({ status: 'completed' });
    const paymentsToday = await Payment.countDocuments({
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // Revenue calculation
    const revenueStats = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$planType', 'monthly'] },
                '$finalAmount',
                0
              ]
            }
          },
          yearlyRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$planType', 'yearly'] },
                '$finalAmount',
                0
              ]
            }
          },
          examPurchaseRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$planType', 'exam_purchase'] },
                '$finalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, monthlyRevenue: 0, yearlyRevenue: 0, examPurchaseRevenue: 0 };

    // Recent activity
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPayments = await Payment.find({ status: 'completed' })
      .populate('userId', 'name email')
      .sort({ completedAt: -1 })
      .limit(5);

    const recentResults = await Result.find({ isCompleted: true })
      .populate('userId', 'name')
      .populate('examId', 'title')
      .sort({ submittedAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          premium: premiumUsers
        },
        exams: {
          total: totalExams,
          active: activeExams,
          premium: premiumExams
        },
        questions: {
          total: totalQuestions,
          active: activeQuestions
        },
        attempts: {
          total: totalAttempts,
          today: attemptsToday
        },
        payments: {
          total: totalPayments,
          today: paymentsToday,
          revenue: {
            total: revenue.totalRevenue,
            monthly: revenue.monthlyRevenue,
            yearly: revenue.yearlyRevenue,
            examPurchase: revenue.examPurchaseRevenue
          }
        }
      },
      recent: {
        users: recentUsers,
        payments: recentPayments,
        results: recentResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, subscriptionType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (subscriptionType) query.subscriptionType = subscriptionType;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role/status
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, subscriptionType, subscriptionExpiry } = req.body;

    const updateFields = {};
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (subscriptionType) updateFields.subscriptionType = subscriptionType;
    if (subscriptionExpiry) updateFields.subscriptionExpiry = subscriptionExpiry;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    // Prevent deleting superadmin or admin users
    if (user.role === 'superadmin' || user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
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
      message: 'User and all related data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/admin/payments
// @access  Private/Admin
exports.getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, planType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;
    if (planType) query.planType = planType;

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    // Calculate total revenue
    const revenueStats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$finalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      revenue: revenueStats[0] || { totalAmount: 0, count: 0 },
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Exam attempts over time
    const examAttempts = await Result.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          isCompleted: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue over time
    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          amount: { $sum: '$finalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most popular exams
    const popularExams = await Result.aggregate([
      {
        $match: {
          submittedAt: { $gte: startDate },
          isCompleted: true
        }
      },
      {
        $group: {
          _id: '$examId',
          attempts: { $sum: 1 }
        }
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'exams',
          localField: '_id',
          foreignField: '_id',
          as: 'exam'
        }
      },
      {
        $unwind: '$exam'
      },
      {
        $project: {
          _id: 1,
          attempts: 1,
          title: '$exam.title',
          category: '$exam.category'
        }
      }
    ]);

    // Subscription distribution
    const subscriptionDistribution = await User.aggregate([
      {
        $group: {
          _id: '$subscriptionType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userGrowth,
        examAttempts,
        revenueData,
        popularExams,
        subscriptionDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate admit cards
// @route   POST /api/admin/admitcards
// @access  Private/Admin
exports.generateAdmitCards = async (req, res, next) => {
  try {
    const { examId, userIds, examDetails, instructions, itemsToBring } = req.body;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const generatedAdmitCards = [];

    for (const userId of userIds) {
      const user = await User.findById(userId);
      if (!user) continue;

      // Generate roll number for this exam
      const rollNumber = `SS${exam._id.toString().slice(-6)}${user._id.toString().slice(-6)}`;
      const registrationNumber = `REG${Date.now()}${user._id.toString().slice(-4)}`;

      // Check if admit card already exists
      const existingAdmitCard = await AdmitCard.findOne({ userId, examId });
      if (existingAdmitCard) {
        continue;
      }

      const admitCard = await AdmitCard.create({
        userId,
        examId,
        rollNumber,
        registrationNumber,
        candidateName: user.name,
        dateOfBirth: req.body.dateOfBirth || new Date(),
        gender: req.body.gender || 'Male',
        category: req.body.category || 'General',
        examDetails,
        instructions: instructions || [],
        itemsToBring: itemsToBring || [],
        isGenerated: true,
        generatedAt: new Date(),
        generatedBy: req.user.id
      });

      generatedAdmitCards.push(admitCard);
    }

    res.status(201).json({
      success: true,
      count: generatedAdmitCards.length,
      message: `${generatedAdmitCards.length} admit cards generated successfully`,
      admitCards: generatedAdmitCards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admit cards
// @route   GET /api/admin/admitcards
// @access  Private/Admin
exports.getAllAdmitCards = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, examId, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (examId) query.examId = examId;
    if (status) query.status = status;

    const admitCards = await AdmitCard.find(query)
      .populate('userId', 'name email')
      .populate('examId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdmitCard.countDocuments(query);

    res.status(200).json({
      success: true,
      count: admitCards.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      admitCards
    });
  } catch (error) {
    next(error);
  }
};
