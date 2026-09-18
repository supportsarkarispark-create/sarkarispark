const { Question, Exam } = require('../models');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all questions for an exam
// @route   GET /api/questions/exam/:examId
// @access  Private/Admin
exports.getQuestions = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { page = 1, limit = 20, subject, topic, difficulty } = req.query;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Build query - match both ObjectId and string formats for examId
    const query = {
      $or: [
        { examId: new mongoose.Types.ObjectId(examId) },
        { examId: examId }
      ]
    };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private/Admin
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify exam exists
    const exam = await Exam.findById(req.body.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    req.body.createdBy = req.user.id;
    req.body.isActive = true; // Ensure question is active by default

    // Convert examId string to ObjectId if provided
    if (req.body.examId && mongoose.Types.ObjectId.isValid(req.body.examId)) {
      req.body.examId = new mongoose.Types.ObjectId(req.body.examId);
    }

    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create multiple questions (bulk)
// @route   POST /api/questions/bulk
// @access  Private/Admin
exports.createBulkQuestions = async (req, res, next) => {
  try {
    const { examId, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Convert examId to ObjectId for consistent storage
    const examIdObject = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : examId;

    // Add examId and createdBy to each question
    const questionsWithData = questions.map(q => ({
      ...q,
      examId: examIdObject,
      createdBy: req.user.id
    }));

    const createdQuestions = await Question.insertMany(questionsWithData);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import questions from JSON/CSV
// @route   POST /api/questions/import
// @access  Private/Admin
exports.importQuestions = async (req, res, next) => {
  try {
    const { examId, format, data } = req.body;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    let questions = [];

    if (format === 'json') {
      questions = JSON.parse(data);
    } else {
      // Handle CSV format - would need a CSV parser
      return res.status(400).json({
        success: false,
        message: 'CSV format not yet supported. Use JSON.'
      });
    }

    // Validate and process questions
    const processedQuestions = questions.map(q => ({
      examId,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      marks: q.marks || 1,
      negativeMark: q.negativeMark || 0,
      difficulty: q.difficulty || 'Medium',
      subject: q.subject || '',
      topic: q.topic || '',
      questionType: q.questionType || 'Single Choice',
      language: q.language || 'English',
      createdBy: req.user.id
    }));

    const createdQuestions = await Question.insertMany(processedQuestions);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      message: 'Questions imported successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subjects for an exam
// @route   GET /api/questions/subjects/:examId
// @access  Public
exports.getSubjects = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const subjects = await Question.distinct('subject', { examId, isActive: true });

    res.status(200).json({
      success: true,
      subjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get topics for a subject
// @route   GET /api/questions/topics/:examId
// @access  Public
exports.getTopics = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { subject } = req.query;

    const query = { examId, isActive: true };
    if (subject) query.subject = subject;

    const topics = await Question.distinct('topic', query);

    res.status(200).json({
      success: true,
      topics
    });
  } catch (error) {
    next(error);
  }
};
