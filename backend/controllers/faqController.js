const Faq = require('../models/Faq');

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
exports.getAllFaqs = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const faqs = await Faq.find(query).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single FAQ
// @route   GET /api/faqs/:id
// @access  Public
exports.getFaqById = async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new FAQ (Admin only)
// @route   POST /api/faqs
// @access  Private/Admin
exports.createFaq = async (req, res, next) => {
  try {
    const { question, answer, category, isActive, order } = req.body;

    const faq = await Faq.create({
      question,
      answer,
      category: category || 'General',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update FAQ (Admin only)
// @route   PUT /api/faqs/:id
// @access  Private/Admin
exports.updateFaq = async (req, res, next) => {
  try {
    const { question, answer, category, isActive, order } = req.body;

    let faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    faq = await Faq.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer,
        category,
        isActive,
        order
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete FAQ (Admin only)
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
exports.deleteFaq = async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    await Faq.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle FAQ active status (Admin only)
// @route   PATCH /api/faqs/:id/toggle
// @access  Private/Admin
exports.toggleFaqStatus = async (req, res, next) => {
  try {
    const faq = await Faq.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }

    faq.isActive = !faq.isActive;
    await faq.save();

    res.status(200).json({
      success: true,
      message: `FAQ ${faq.isActive ? 'activated' : 'deactivated'} successfully`,
      data: faq
    });
  } catch (error) {
    next(error);
  }
};
