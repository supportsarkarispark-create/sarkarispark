const { Settings, User, Exam, Question } = require('../models');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    // Real-time live counts directly from MongoDB collections
    const [userCount, examCount, questionCount] = await Promise.all([
      User.countDocuments(),
      Exam.countDocuments({ isActive: true }),
      Question.countDocuments()
    ]);

    const settingsObj = settings.toObject();

    // Ensure active social links for Instagram and YouTube
    if (settingsObj.contactInfo) {
      if (!settingsObj.contactInfo.instagram) {
        settingsObj.contactInfo.instagram = 'https://www.instagram.com/sarkari_spark?stkn=MWZmN3FpYnkxOHJyeQ==';
      }
      if (!settingsObj.contactInfo.youtube) {
        settingsObj.contactInfo.youtube = 'https://youtube.com/@sarkarispark-2026?si=TW7tpWlBpqBLLFQM';
      }
    }

    // Attach real live numbers from the database
    settingsObj.heroStats = {
      activeStudents: userCount,
      mockTests: examCount,
      questions: questionCount
    };

    res.status(200).json({
      success: true,
      settings: settingsObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const { heroStats, examCategories, heroBadge, heroTitle, heroDescription, aboutSection, contactInfo, subscriptionPricing } = req.body;
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }
    
    // Update fields if provided
    if (heroStats) settings.heroStats = heroStats;
    if (examCategories) settings.examCategories = examCategories;
    if (heroBadge) settings.heroBadge = heroBadge;
    if (heroTitle) settings.heroTitle = heroTitle;
    if (heroDescription) settings.heroDescription = heroDescription;
    if (aboutSection) settings.aboutSection = { ...settings.aboutSection, ...aboutSection };
    if (contactInfo) settings.contactInfo = contactInfo;
    if (subscriptionPricing) settings.subscriptionPricing = subscriptionPricing;
    
    settings.updatedAt = Date.now();
    settings.updatedBy = req.user.id;
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    next(error);
  }
};
