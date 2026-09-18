const { SarkariWork } = require('../models');

// @desc    Get all sarkari works (Public)
// @route   GET /api/sarkari-works
// @access  Public
exports.getSarkariWorks = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    // Build query
    const query = { isActive: true };
    if (category) {
      query.category = category === 'uncategorized' ? '' : category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const works = await SarkariWork.find(query)
      .sort({ order: 1, createdAt: -1 });

    // Distinct categories for active works
    const categories = await SarkariWork.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      count: works.length,
      categories,
      works
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sarkari work (Public)
// @route   GET /api/sarkari-works/:id
// @access  Public
exports.getSarkariWork = async (req, res, next) => {
  try {
    const work = await SarkariWork.findById(req.params.id);

    if (!work || !work.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    res.status(200).json({
      success: true,
      work
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create sarkari work (Admin)
// @route   POST /api/sarkari-works
// @access  Private/Admin
exports.createSarkariWork = async (req, res, next) => {
  try {
    const { title, description, link, category, order, isActive, image } = req.body;

    const work = await SarkariWork.create({
      title,
      description,
      link,
      category: category || '',
      image: image || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Government work card created successfully',
      work
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sarkari work (Admin)
// @route   PUT /api/sarkari-works/:id
// @access  Private/Admin
exports.updateSarkariWork = async (req, res, next) => {
  try {
    const { title, description, link, category, order, isActive, image } = req.body;

    let work = await SarkariWork.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    // Update fields
    if (title) work.title = title;
    if (description) work.description = description;
    if (link) work.link = link;
    if (category !== undefined) work.category = category || '';
    if (order !== undefined) work.order = order;
    if (isActive !== undefined) work.isActive = isActive;
    if (image !== undefined) work.image = image;

    work.updatedAt = Date.now();
    await work.save();

    res.status(200).json({
      success: true,
      message: 'Government work card updated successfully',
      work
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sarkari work (Admin)
// @route   DELETE /api/sarkari-works/:id
// @access  Private/Admin
exports.deleteSarkariWork = async (req, res, next) => {
  try {
    const work = await SarkariWork.findById(req.params.id);

    if (!work) {
      return res.status(404).json({
        success: false,
        message: 'Work not found'
      });
    }

    await SarkariWork.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Government work card deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sarkari works for admin (Admin)
// @route   GET /api/sarkari-works/admin/all
// @access  Private/Admin
exports.getAllSarkariWorksAdmin = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category === 'uncategorized' ? '' : category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const works = await SarkariWork.find(query)
      .populate('createdBy', 'name email')
      .sort({ category: 1, order: 1, createdAt: -1 });

    const total = await SarkariWork.countDocuments(query);
    
    // Distinct categories for all works
    const categories = await SarkariWork.distinct('category');

    res.status(200).json({
      success: true,
      count: works.length,
      total,
      categories,
      works
    });
  } catch (error) {
    next(error);
  }
};
