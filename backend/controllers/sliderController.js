// Import Slider model directly
const Slider = require('../models/Slider');

// @desc    Get all active sliders (Public)
// @route   GET /api/slider
// @access  Public
exports.getSliders = async (req, res, next) => {
  try {
    const sliders = await Slider.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sliders.length,
      sliders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single slider (Public)
// @route   GET /api/slider/:id
// @access  Public
exports.getSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    res.status(200).json({
      success: true,
      slider
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sliders (Admin)
// @route   GET /api/slider/admin/all
// @access  Private/Admin
exports.getAllSlidersAdmin = async (req, res, next) => {
  try {
    const sliders = await Slider.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sliders.length,
      sliders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create slider (Admin)
// @route   POST /api/slider
// @access  Private/Admin
exports.createSlider = async (req, res, next) => {
  try {
    const { title, subtitle, redirectUrl, videoDuration } = req.body;
    
    // Handle image: use uploaded file path or URL from body
    let image = req.body.imageUrl;
    if (!image && typeof req.body.image === 'string') {
      image = req.body.image;
    }
    if (req.files && req.files.image && req.files.image[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Handle video: use uploaded file path or URL from body
    let video = req.body.videoUrl;
    if (!video && typeof req.body.video === 'string') {
      video = req.body.video;
    }
    if (req.files && req.files.video && req.files.video[0]) {
      video = `/uploads/${req.files.video[0].filename}`;
    }

    // Parse FormData values
    const isActive = req.body.isActive === 'true' || req.body.isActive === true;
    const order = parseInt(req.body.order) || 0;
    const duration = videoDuration ? parseInt(videoDuration) : 0;

    const slider = await Slider.create({
      image,
      video: video || '',
      videoDuration: duration,
      title: title || '',
      subtitle: subtitle || '',
      redirectUrl: redirectUrl || '',
      isActive,
      order
    });

    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      slider
    });
  } catch (error) {
    console.error('Create slider error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.toString()
    });
  }
};

// @desc    Update slider (Admin)
// @route   PUT /api/slider/:id
// @access  Private/Admin
exports.updateSlider = async (req, res, next) => {
  try {
    const { title, subtitle, redirectUrl, videoDuration } = req.body;

    let slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    // Handle image: use uploaded file path or URL from body
    let image = req.body.imageUrl;
    if (!image && typeof req.body.image === 'string') {
      image = req.body.image;
    }
    if (req.files && req.files.image && req.files.image[0]) {
      image = `/uploads/${req.files.image[0].filename}`;
    }

    // Handle video: use uploaded file path or URL from body
    let video = req.body.videoUrl;
    if (!video && typeof req.body.video === 'string') {
      video = req.body.video;
    }
    if (req.files && req.files.video && req.files.video[0]) {
      video = `/uploads/${req.files.video[0].filename}`;
    }

    // Parse FormData values
    const isActiveValue = req.body.isActive;
    const orderValue = req.body.order;
    const duration = videoDuration !== undefined ? parseInt(videoDuration) : undefined;

    // Update fields
    if (image && typeof image === 'string') slider.image = image;
    if (video !== undefined) slider.video = video;
    if (duration !== undefined) slider.videoDuration = duration;
    if (title !== undefined) slider.title = title;
    if (subtitle !== undefined) slider.subtitle = subtitle;
    if (redirectUrl !== undefined) slider.redirectUrl = redirectUrl;
    if (isActiveValue !== undefined) {
      slider.isActive = isActiveValue === 'true' || isActiveValue === true;
    }
    if (orderValue !== undefined) {
      slider.order = parseInt(orderValue) || 0;
    }

    slider.updatedAt = Date.now();
    await slider.save();

    res.status(200).json({
      success: true,
      message: 'Slider updated successfully',
      slider
    });
  } catch (error) {
    console.error('Update slider error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.toString()
    });
  }
};

// @desc    Delete slider (Admin)
// @route   DELETE /api/slider/:id
// @access  Private/Admin
exports.deleteSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findById(req.params.id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found'
      });
    }

    await slider.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
