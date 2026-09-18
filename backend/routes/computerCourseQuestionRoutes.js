const express = require('express');
const router = express.Router();
const ComputerCourseQuestion = require('../models/ComputerCourseQuestion');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/computer-course-questions
// @desc    Get all computer course questions with pagination
// @access  Admin only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, examId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (examId) {
      query.examId = examId;
    }

    const questions = await ComputerCourseQuestion.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('examId', 'title');

    const total = await ComputerCourseQuestion.countDocuments(query);

    res.json({
      success: true,
      questions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get computer course questions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/computer-course-questions/:id
// @desc    Get single question by ID
// @access  Admin only
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await ComputerCourseQuestion.findById(req.params.id).populate('examId', 'title');
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get computer course question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/computer-course-questions
// @desc    Create new computer course question
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { examId, question, options, correctOption, explanation, marks, difficulty, order } = req.body;

    if (!examId || !question || !options || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const questionDoc = await ComputerCourseQuestion.create({
      examId,
      question,
      options,
      correctOption,
      explanation,
      marks: marks || 1,
      difficulty: difficulty || 'Medium',
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: questionDoc
    });
  } catch (error) {
    console.error('Create computer course question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/computer-course-questions/:id
// @desc    Update computer course question
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { question, options, correctOption, explanation, marks, difficulty, order, isActive } = req.body;

    const questionDoc = await ComputerCourseQuestion.findByIdAndUpdate(
      req.params.id,
      { question, options, correctOption, explanation, marks, difficulty, order, isActive },
      { new: true, runValidators: true }
    );

    if (!questionDoc) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      question: questionDoc
    });
  } catch (error) {
    console.error('Update computer course question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/computer-course-questions/:id
// @desc    Delete computer course question
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await ComputerCourseQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete computer course question error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
