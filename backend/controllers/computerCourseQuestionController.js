const { ComputerCourseQuestion, ComputerCourseExam } = require('../models');

// @desc    Get all questions for an exam
// @route   GET /api/computer-course-questions/exam/:examId
// @access  Public (with premium/login checks)
exports.getExamQuestions = async (req, res, next) => {
  try {
    const { examId } = req.params;

    // Check exam exists and get access type
    const exam = await ComputerCourseExam.findById(examId);
    if (!exam || !exam.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check access permissions - already handled by checkExamAccess middleware
    // but kept here as a second layer if needed.
    // However, the checkExamAccess middleware is more comprehensive.
    // For now, we trust the middleware has allowed the request.

    const questions = await ComputerCourseQuestion.find({
      examId,
      isActive: true
    })
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: questions.length,
      questions: questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order,
        isActive: q.isActive
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions for admin (includes inactive)
// @route   GET /api/computer-course-questions/exam/:examId/admin
// @access  Private/Admin
exports.getExamQuestionsAdmin = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const questions = await ComputerCourseQuestion.find({ examId })
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: questions.length,
      questions: questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        marks: q.marks,
        difficulty: q.difficulty,
        order: q.order,
        isActive: q.isActive,
        createdAt: q.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single question
// @route   GET /api/computer-course-questions/:id
// @access  Public
exports.getQuestion = async (req, res, next) => {
  try {
    const question = await ComputerCourseQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      question: {
        id: question._id,
        examId: question.examId,
        question: question.question,
        options: question.options,
        correctOption: question.correctOption,
        explanation: question.explanation,
        marks: question.marks,
        difficulty: question.difficulty,
        order: question.order,
        isActive: question.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question (Admin only)
// @route   POST /api/computer-course-questions
// @access  Private/Admin
exports.createQuestion = async (req, res, next) => {
  try {
    const { examId, question, options, correctOption, explanation, marks, difficulty, order } = req.body;

    // Validate exam exists
    const exam = await ComputerCourseExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Validate options
    if (!options || options.length < 2 || options.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Options must be between 2 and 4'
      });
    }

    if (correctOption < 0 || correctOption >= options.length) {
      return res.status(400).json({
        success: false,
        message: 'Correct option index is invalid'
      });
    }

    const newQuestion = await ComputerCourseQuestion.create({
      examId,
      question,
      options: options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === correctOption
      })),
      correctOption,
      explanation,
      marks: marks || 1,
      difficulty: difficulty || 'Medium',
      order: order || 0
    });

    res.status(201).json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create multiple questions (Admin only)
// @route   POST /api/computer-course-questions/bulk
// @access  Private/Admin
exports.createBulkQuestions = async (req, res, next) => {
  try {
    const { examId, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questions array'
      });
    }

    // Validate exam exists
    const exam = await ComputerCourseExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const formattedQuestions = questions.map((q, index) => ({
      examId,
      question: q.question,
      options: q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctOption
      })),
      correctOption: q.correctOption,
      explanation: q.explanation || '',
      marks: q.marks || 1,
      difficulty: q.difficulty || 'Medium',
      order: q.order !== undefined ? q.order : index
    }));

    const createdQuestions = await ComputerCourseQuestion.insertMany(formattedQuestions);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      questions: createdQuestions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question (Admin only)
// @route   PUT /api/computer-course-questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await ComputerCourseQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const { question: questionText, options, correctOption, explanation, marks, difficulty, order } = req.body;

    // Validate options if provided
    if (options) {
      if (options.length < 2 || options.length > 4) {
        return res.status(400).json({
          success: false,
          message: 'Options must be between 2 and 4'
        });
      }

      if (correctOption !== undefined && (correctOption < 0 || correctOption >= options.length)) {
        return res.status(400).json({
          success: false,
          message: 'Correct option index is invalid'
        });
      }

      req.body.options = options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === (correctOption !== undefined ? correctOption : question.correctOption)
      }));
    }

    question = await ComputerCourseQuestion.findByIdAndUpdate(
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

// @desc    Delete question (Admin only)
// @route   DELETE /api/computer-course-questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await ComputerCourseQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle question status (Admin only)
// @route   PATCH /api/computer-course-questions/:id/toggle
// @access  Private/Admin
exports.toggleQuestionStatus = async (req, res, next) => {
  try {
    const question = await ComputerCourseQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    question.isActive = !question.isActive;
    await question.save();

    res.status(200).json({
      success: true,
      isActive: question.isActive,
      message: `Question ${question.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all questions for an exam (Admin only)
// @route   DELETE /api/computer-course-questions/exam/:examId
// @access  Private/Admin
exports.deleteAllExamQuestions = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const result = await ComputerCourseQuestion.deleteMany({ examId });

    res.status(200).json({
      success: true,
      count: result.deletedCount,
      message: 'All questions deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Import questions from JSON (Admin only)
// @route   POST /api/computer-course-questions/import
// @access  Private/Admin
exports.importQuestions = async (req, res, next) => {
  try {
    const { examId, questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questions array'
      });
    }

    // Validate exam exists
    const exam = await ComputerCourseExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    const formattedQuestions = questions.map((q, index) => ({
      examId,
      question: q.question,
      options: q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctOption
      })),
      correctOption: q.correctOption,
      explanation: q.explanation || '',
      marks: q.marks || 1,
      difficulty: q.difficulty || 'Medium',
      order: index
    }));

    const createdQuestions = await ComputerCourseQuestion.insertMany(formattedQuestions);

    res.status(201).json({
      success: true,
      count: createdQuestions.length,
      message: `${createdQuestions.length} questions imported successfully`
    });
  } catch (error) {
    next(error);
  }
};
