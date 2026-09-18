const { GovernmentResult } = require('../models');

// @desc    Get all government results (Public)
// @route   GET /api/gov-results
// @access  Public
exports.getGovResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, latest } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    if (latest === 'true') query.isLatest = true;

    const results = await GovernmentResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GovernmentResult.countDocuments(query);

    // Get categories for filter
    const categories = await GovernmentResult.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      categories,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single government result (Public)
// @route   GET /api/gov-results/:id
// @access  Public
exports.getGovResult = async (req, res, next) => {
  try {
    const result = await GovernmentResult.findById(req.params.id);

    if (!result || !result.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Increment view count
    result.viewCount += 1;
    await result.save();

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create government result (Admin)
// @route   POST /api/gov-results
// @access  Private/Admin
exports.createGovResult = async (req, res, next) => {
  try {
    const { title, description, organization, link, resultDate, category, isLatest } = req.body;
    
    // Handle image: use uploaded file path or URL from body
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const result = await GovernmentResult.create({
      title,
      description,
      organization,
      image,
      link,
      resultDate: resultDate || Date.now(),
      category,
      isLatest: isLatest !== undefined ? isLatest : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Government result created successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update government result (Admin)
// @route   PUT /api/gov-results/:id
// @access  Private/Admin
exports.updateGovResult = async (req, res, next) => {
  try {
    const { title, description, organization, link, resultDate, category, isLatest, isActive } = req.body;

    let result = await GovernmentResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Handle image: use uploaded file path or URL from body
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Update fields
    if (title) result.title = title;
    if (description) result.description = description;
    if (organization) result.organization = organization;
    if (image !== undefined) result.image = image;
    if (link) result.link = link;
    if (resultDate) result.resultDate = resultDate;
    if (category) result.category = category;
    if (isLatest !== undefined) result.isLatest = isLatest;
    if (isActive !== undefined) result.isActive = isActive;

    result.updatedAt = Date.now();
    await result.save();

    res.status(200).json({
      success: true,
      message: 'Government result updated successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete government result (Admin)
// @route   DELETE /api/gov-results/:id
// @access  Private/Admin
exports.deleteGovResult = async (req, res, next) => {
  try {
    const result = await GovernmentResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    await GovernmentResult.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Government result deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all government results for admin (Admin)
// @route   GET /api/gov-results/admin/all
// @access  Private/Admin
exports.getAllGovResultsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const results = await GovernmentResult.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GovernmentResult.countDocuments(query);

    // Get categories for filter
    const categories = await GovernmentResult.distinct('category');

    res.status(200).json({
      success: true,
      count: results.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      categories,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle latest status (Admin)
// @route   PUT /api/gov-results/:id/toggle-latest
// @access  Private/Admin
exports.toggleLatest = async (req, res, next) => {
  try {
    const result = await GovernmentResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    result.isLatest = !result.isLatest;
    await result.save();

    res.status(200).json({
      success: true,
      message: `Result marked as ${result.isLatest ? 'Latest' : 'Not Latest'}`,
      isLatest: result.isLatest
    });
  } catch (error) {
    next(error);
  }
};
