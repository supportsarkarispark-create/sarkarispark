const { SarkariAdmitCard } = require('../models');

// @desc    Get all sarkari admit cards (public)
// @route   GET /api/sarkari-admit-cards
// @access  Public
exports.getAllSarkariAdmitCards = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      latest 
    } = req.query;

    const query = { isActive: true };

    // Filter by latest
    if (latest === 'true') {
      query.isLatest = true;
    }

    // Search functionality
    if (search) {
      Object.assign(query, {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { postName: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (page - 1) * limit;

    const [admitCards, total] = await Promise.all([
      SarkariAdmitCard.find(query)
        .sort({ isLatest: -1, admitCardReleaseDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      SarkariAdmitCard.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: admitCards.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      admitCards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sarkari admit card (public)
// @route   GET /api/sarkari-admit-cards/:id
// @access  Public
exports.getSarkariAdmitCard = async (req, res, next) => {
  try {
    const admitCard = await SarkariAdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    // Increment view count
    admitCard.viewCount += 1;
    await admitCard.save();

    res.status(200).json({
      success: true,
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sarkari admit card (Admin only)
// @route   POST /api/sarkari-admit-cards
// @access  Private/Admin
exports.createSarkariAdmitCard = async (req, res, next) => {
  try {
    const {
      title,
      postName,
      image,
      descriptionText,
      descriptionImage,
      admitCardReleaseDate,
      lastDateToDownload,
      downloadLink,
      isLatest
    } = req.body;

    const admitCard = await SarkariAdmitCard.create({
      title,
      postName,
      image,
      descriptionText,
      descriptionImage,
      admitCardReleaseDate,
      lastDateToDownload,
      downloadLink,
      isLatest
    });

    res.status(201).json({
      success: true,
      message: 'Admit card created successfully',
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sarkari admit card (Admin only)
// @route   PUT /api/sarkari-admit-cards/:id
// @access  Private/Admin
exports.updateSarkariAdmitCard = async (req, res, next) => {
  try {
    let admitCard = await SarkariAdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    const {
      title,
      postName,
      image,
      descriptionText,
      descriptionImage,
      admitCardReleaseDate,
      lastDateToDownload,
      downloadLink,
      isActive,
      isLatest
    } = req.body;

    admitCard = await SarkariAdmitCard.findByIdAndUpdate(
      req.params.id,
      {
        title,
        postName,
        image,
        descriptionText,
        descriptionImage,
        admitCardReleaseDate,
        lastDateToDownload,
        downloadLink,
        isActive,
        isLatest
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Admit card updated successfully',
      admitCard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sarkari admit card (Admin only)
// @route   DELETE /api/sarkari-admit-cards/:id
// @access  Private/Admin
exports.deleteSarkariAdmitCard = async (req, res, next) => {
  try {
    const admitCard = await SarkariAdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    await admitCard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admit card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sarkari admit cards (Admin - includes inactive)
// @route   GET /api/sarkari-admit-cards/admin/all
// @access  Private/Admin
exports.getAllSarkariAdmitCardsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;

    const query = {};

    if (search) {
      Object.assign(query, {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { organization: { $regex: search, $options: 'i' } },
          { postName: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const skip = (page - 1) * limit;

    const [admitCards, total] = await Promise.all([
      SarkariAdmitCard.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      SarkariAdmitCard.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: admitCards.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      admitCards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle latest status (Admin only)
// @route   PATCH /api/sarkari-admit-cards/:id/latest
// @access  Private/Admin
exports.toggleLatest = async (req, res, next) => {
  try {
    const admitCard = await SarkariAdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    admitCard.isLatest = !admitCard.isLatest;
    await admitCard.save();

    res.status(200).json({
      success: true,
      isLatest: admitCard.isLatest,
      message: `Admit card ${admitCard.isLatest ? 'marked as latest' : 'removed from latest'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle active status (Admin only)
// @route   PATCH /api/sarkari-admit-cards/:id/active
// @access  Private/Admin
exports.toggleActive = async (req, res, next) => {
  try {
    const admitCard = await SarkariAdmitCard.findById(req.params.id);

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: 'Admit card not found'
      });
    }

    admitCard.isActive = !admitCard.isActive;
    await admitCard.save();

    res.status(200).json({
      success: true,
      isActive: admitCard.isActive,
      message: `Admit card ${admitCard.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};
