const Feedback = require('../models/Feedback');
const asyncHandler = require('express-async-handler');

// @desc    Get all approved feedback (public)
// @route   GET /api/feedback
// @access  Public
exports.getApprovedFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ isApproved: true })
    .sort({ isFeatured: -1, createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: feedback.length,
    feedback: feedback.map(fb => ({
      id: fb._id,
      studentName: fb.studentName,
      exam: fb.exam,
      score: fb.score,
      testimonial: fb.testimonial,
      avatar: fb.avatar,
      isFeatured: fb.isFeatured,
      createdAt: fb.createdAt
    }))
  });
});

// @desc    Get all feedback (admin)
// @route   GET /api/feedback/admin
// @access  Private/Admin
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: feedback.length,
    feedback: feedback.map(fb => ({
      id: fb._id,
      studentName: fb.studentName,
      exam: fb.exam,
      score: fb.score,
      testimonial: fb.testimonial,
      avatar: fb.avatar,
      isApproved: fb.isApproved,
      isFeatured: fb.isFeatured,
      createdAt: fb.createdAt
    }))
  });
});

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
exports.createFeedback = asyncHandler(async (req, res) => {
  const { studentName, exam, score, testimonial, avatar } = req.body;
  
  const feedback = await Feedback.create({
    studentName,
    exam,
    score,
    testimonial,
    avatar
  });
  
  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully. It will be visible after approval.',
    feedback: {
      id: feedback._id,
      studentName: feedback.studentName,
      exam: feedback.exam,
      score: feedback.score,
      testimonial: feedback.testimonial,
      avatar: feedback.avatar,
      isApproved: feedback.isApproved,
      isFeatured: feedback.isFeatured
    }
  });
});

// @desc    Update feedback (admin)
// @route   PUT /api/feedback/:id
// @access  Private/Admin
exports.updateFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  const { studentName, exam, score, testimonial, avatar, isApproved, isFeatured } = req.body;
  
  feedback.studentName = studentName || feedback.studentName;
  feedback.exam = exam || feedback.exam;
  feedback.score = score !== undefined ? score : feedback.score;
  feedback.testimonial = testimonial || feedback.testimonial;
  feedback.avatar = avatar !== undefined ? avatar : feedback.avatar;
  feedback.isApproved = isApproved !== undefined ? isApproved : feedback.isApproved;
  feedback.isFeatured = isFeatured !== undefined ? isFeatured : feedback.isFeatured;
  
  await feedback.save();
  
  res.status(200).json({
    success: true,
    feedback: {
      id: feedback._id,
      studentName: feedback.studentName,
      exam: feedback.exam,
      score: feedback.score,
      testimonial: feedback.testimonial,
      avatar: feedback.avatar,
      isApproved: feedback.isApproved,
      isFeatured: feedback.isFeatured
    }
  });
});

// @desc    Delete feedback (admin)
// @route   DELETE /api/feedback/:id
// @access  Private/Admin
exports.deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  await feedback.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'Feedback deleted successfully'
  });
});

// @desc    Toggle approval status
// @route   PATCH /api/feedback/:id/approve
// @access  Private/Admin
exports.toggleApproval = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  feedback.isApproved = !feedback.isApproved;
  await feedback.save();
  
  res.status(200).json({
    success: true,
    message: `Feedback ${feedback.isApproved ? 'approved' : 'unapproved'}`,
    feedback: {
      id: feedback._id,
      isApproved: feedback.isApproved
    }
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/feedback/:id/feature
// @access  Private/Admin
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }
  
  feedback.isFeatured = !feedback.isFeatured;
  await feedback.save();
  
  res.status(200).json({
    success: true,
    message: `Feedback ${feedback.isFeatured ? 'featured' : 'unfeatured'}`,
    feedback: {
      id: feedback._id,
      isFeatured: feedback.isFeatured
    }
  });
});
