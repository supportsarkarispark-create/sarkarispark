const { LatestJob } = require('../models');

// @desc    Get all latest jobs (Public)
// @route   GET /api/latest-jobs
// @access  Public
exports.getLatestJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, latest } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;
    if (latest === 'true') query.isLatest = true;

    const jobs = await LatestJob.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LatestJob.countDocuments(query);

    // Get categories for filter
    const categories = await LatestJob.distinct('category', { isActive: true });

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      categories,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single latest job (Public)
// @route   GET /api/latest-jobs/:id
// @access  Public
exports.getLatestJob = async (req, res, next) => {
  try {
    const job = await LatestJob.findById(req.params.id);

    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.viewCount += 1;
    await job.save();

    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create latest job (Admin)
// @route   POST /api/latest-jobs
// @access  Private/Admin
exports.createLatestJob = async (req, res, next) => {
  try {
    const { title, description, organization, link, postDate, lastDate, category, isLatest } = req.body;
    
    // Handle image: use uploaded file path or URL from body
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const job = await LatestJob.create({
      title,
      description,
      organization,
      image,
      link,
      postDate: postDate || Date.now(),
      lastDate,
      category,
      isLatest: isLatest !== undefined ? isLatest : true,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Latest job created successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update latest job (Admin)
// @route   PUT /api/latest-jobs/:id
// @access  Private/Admin
exports.updateLatestJob = async (req, res, next) => {
  try {
    const { title, description, organization, link, postDate, lastDate, category, isLatest, isActive } = req.body;

    let job = await LatestJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Handle image: use uploaded file path or URL from body
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (organization) job.organization = organization;
    if (image !== undefined) job.image = image;
    if (link) job.link = link;
    if (postDate) job.postDate = postDate;
    if (lastDate) job.lastDate = lastDate;
    if (category) job.category = category;
    if (isLatest !== undefined) job.isLatest = isLatest;
    if (isActive !== undefined) job.isActive = isActive;

    job.updatedAt = Date.now();
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Latest job updated successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete latest job (Admin)
// @route   DELETE /api/latest-jobs/:id
// @access  Private/Admin
exports.deleteLatestJob = async (req, res, next) => {
  try {
    const job = await LatestJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await LatestJob.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Latest job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all latest jobs for admin (Admin)
// @route   GET /api/latest-jobs/admin/all
// @access  Private/Admin
exports.getAllLatestJobsAdmin = async (req, res, next) => {
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

    const jobs = await LatestJob.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await LatestJob.countDocuments(query);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle latest status
// @route   PUT /api/latest-jobs/:id/toggle-latest
// @access  Private/Admin
exports.toggleLatest = async (req, res, next) => {
  try {
    const job = await LatestJob.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job.isLatest = !job.isLatest;
    await job.save();

    res.status(200).json({
      success: true,
      message: `Latest status updated to ${job.isLatest}`,
      isLatest: job.isLatest
    });
  } catch (error) {
    next(error);
  }
};
