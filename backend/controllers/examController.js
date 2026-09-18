const { Exam, Question, Result } = require('../models');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Public
exports.getExams = async (req, res, next) => {
  try {
    const { 
      category, 
      difficulty, 
      isPremium, 
      search, 
      page = 1, 
      limit = 10,
      featured,
      parentExamId,
      isPYQ,
      isParent
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (isPremium !== undefined) query.isPremium = isPremium === 'true';
    if (featured) query.isFeatured = true;
    if (isPYQ !== undefined) query.isPYQ = isPYQ === 'true';
    
    // parentExamId filter: 'null' means parent exams only, specific id means children
    let parentExamIdQuery = null;
    if (parentExamId !== undefined) {
      if (parentExamId === 'null') {
        query.parentExamId = null;
      } else if (mongoose.Types.ObjectId.isValid(parentExamId)) {
        // Match both ObjectId and string formats
        parentExamIdQuery = [
          { parentExamId: new mongoose.Types.ObjectId(parentExamId) },
          { parentExamId: parentExamId }
        ];
      }
    }

    // isParent shorthand for parentExamId=null
    if (isParent === 'true') {
      query.parentExamId = null;
    }

    // Search functionality
    if (search) {
      const searchQuery = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
      // If we have a parentExamId query, combine with $and, otherwise use $or for search
      if (parentExamIdQuery) {
        query.$and = [
          { $or: parentExamIdQuery },
          { $or: searchQuery }
        ];
      } else {
        query.$or = searchQuery;
      }
    } else if (parentExamIdQuery) {
      // Only parentExamId query, no search
      query.$or = parentExamIdQuery;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const exams = await Exam.find(query)
      .populate('createdBy', 'name')
      .sort({ isPYQ: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      count: exams.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      exams: exams.map(exam => ({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        subCategory: exam.subCategory,
        examType: exam.examType,
        parentExamId: exam.parentExamId,
        isPYQ: exam.isPYQ,
        testNumber: exam.testNumber,
        isPremium: exam.isPremium,
        pricing: exam.pricing,
        price: exam.price,
        discountPrice: exam.discountPrice,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        difficulty: exam.difficulty,
        language: exam.language,
        isFeatured: exam.isFeatured,
        image: exam.image,
        tags: exam.tags,
        attempts: exam.attempts,
        ratings: exam.ratings,
        createdAt: exam.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Public
exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Get question count
    const questionCount = await Question.countDocuments({ examId: exam._id, isActive: true });

    res.status(200).json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        subCategory: exam.subCategory,
        examType: exam.examType,
        parentExamId: exam.parentExamId,
        isPYQ: exam.isPYQ,
        testNumber: exam.testNumber,
        isPremium: exam.isPremium,
        pricing: exam.pricing,
        price: exam.price,
        discountPrice: exam.discountPrice,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        negativeMarking: exam.negativeMarking,
        totalQuestions: exam.totalQuestions,
        availableQuestions: questionCount,
        difficulty: exam.difficulty,
        language: exam.language,
        instructions: exam.instructions,
        syllabus: exam.syllabus,
        isFeatured: exam.isFeatured,
        startDate: exam.startDate,
        endDate: exam.endDate,
        image: exam.image,
        tags: exam.tags,
        attempts: exam.attempts,
        ratings: exam.ratings,
        createdAt: exam.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tests under a parent exam
// @route   GET /api/exams/:id/tests
// @access  Public
exports.getExamTests = async (req, res, next) => {
  try {
    const parentId = req.params.id;

    if (!parentId || !mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID format'
      });
    }

    const parentObjectId = new mongoose.Types.ObjectId(parentId);

    // STRATEGY 1: Direct match with ObjectId
    let tests = await Exam.find({
      parentExamId: parentObjectId,
      isActive: true
    }).select('title description duration totalQuestions totalMarks difficulty isPremium testNumber');

    // STRATEGY 2: If no results, try string match
    if (tests.length === 0) {
      tests = await Exam.find({
        parentExamId: parentId,
        isActive: true
      }).select('title description duration totalQuestions totalMarks difficulty isPremium testNumber');
    }

    // STRATEGY 3: If still no results, try $or with both formats
    if (tests.length === 0) {
      tests = await Exam.find({
        $and: [
          {
            $or: [
              { parentExamId: parentObjectId },
              { parentExamId: parentId }
            ]
          },
          { isActive: true }
        ]
      }).select('title description duration totalQuestions totalMarks difficulty isPremium testNumber');
    }

    // STRATEGY 4: Check all tests without isActive filter (for debugging)
    const allTests = await Exam.find({
      $or: [
        { parentExamId: parentObjectId },
        { parentExamId: parentId }
      ]
    }).select('title isActive parentExamId');

    // Sort final results
    tests = tests.sort((a, b) => (a.testNumber || 0) - (b.testNumber || 0));

    res.status(200).json({
      success: true,
      count: tests.length,
      tests: tests.map(test => ({
        id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        totalMarks: test.totalMarks,
        difficulty: test.difficulty,
        isPremium: test.isPremium,
        testNumber: test.testNumber
      }))
    });
  } catch (error) {
    console.error('[ERROR] getExamTests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get exam categories
// @route   GET /api/exams/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Exam.distinct('category');
    
    // Get count for each category
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Exam.countDocuments({ category: cat, isActive: true });
        return { name: cat, count };
      })
    );

    res.status(200).json({
      success: true,
      categories: categoryStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get computer course exams only
// @route   GET /api/exams/computer
// @access  Private/Admin
exports.getComputerExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({ category: 'Computer Exams' })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams: exams.map(exam => ({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        category: exam.category,
        subCategory: exam.subCategory,
        examType: exam.examType,
        isPremium: exam.isPremium,
        price: exam.price,
        discountPrice: exam.discountPrice,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        difficulty: exam.difficulty,
        language: exam.language,
        isFeatured: exam.isFeatured,
        isActive: exam.isActive,
        image: exam.image,
        tags: exam.tags,
        attempts: exam.attempts,
        ratings: exam.ratings,
        createdAt: exam.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create exam (Admin only)
// @route   POST /api/exams
// @access  Private/Admin
exports.createExam = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    req.body.createdBy = req.user.id;

    // Convert empty string parentExamId to null
    if (req.body.parentExamId === '') {
      req.body.parentExamId = null;
    }

    // Convert parentExamId string to ObjectId if provided
    if (req.body.parentExamId && mongoose.Types.ObjectId.isValid(req.body.parentExamId)) {
      req.body.parentExamId = new mongoose.Types.ObjectId(req.body.parentExamId);
    }

    const exam = await Exam.create(req.body);

    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam (Admin only)
// @route   PUT /api/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Convert empty string parentExamId to null
    if (req.body.parentExamId === '') {
      req.body.parentExamId = null;
    }

    // Convert parentExamId string to ObjectId if provided
    if (req.body.parentExamId && mongoose.Types.ObjectId.isValid(req.body.parentExamId)) {
      req.body.parentExamId = new mongoose.Types.ObjectId(req.body.parentExamId);
    }

    exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam (Admin only)
// @route   DELETE /api/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Soft delete - set isActive to false
    exam.isActive = false;
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exam questions
// @route   GET /api/exams/:id/questions
// @access  Private (for attempting exam)
exports.getExamQuestions = async (req, res, next) => {
  try {
    const examId = req.params.id;
    
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if premium exam and user has subscription
    if (exam.isPremium && req.user.subscriptionType === 'free') {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required to access this exam'
      });
    }

    // Check subscription expiry if user is not admin
    if (exam.isPremium && req.user.role === 'user' && 
        req.user.subscriptionExpiry && req.user.subscriptionExpiry < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'Your premium subscription has expired. Please renew to access this exam.'
      });
    }

    // Get all questions for this exam (any status)
    // Try both string and ObjectId format
    const mongoose = require('mongoose');
    let questions = [];
    
    if (mongoose.Types.ObjectId.isValid(examId)) {
      const objectId = new mongoose.Types.ObjectId(examId);
      
      // Query with ObjectId - ONLY ACTIVE QUESTIONS
      questions = await Question.find({ examId: objectId, isActive: true });
      
      // If no results, try with string
      if (questions.length === 0) {
        questions = await Question.find({ examId: examId, isActive: true });
      }
    } else {
      // Query with string - ONLY ACTIVE QUESTIONS
      questions = await Question.find({ examId: examId, isActive: true });
    }

    // Debug: Show all questions in database for this exam
    const allQuestions = await Question.find({});

    // Shuffle questions
    questions = questions.sort(() => Math.random() - 0.5);

    // Limit to totalQuestions specified in exam
    questions = questions.slice(0, exam.totalQuestions);

    // Process questions: shuffle options and include Hindi content
    const questionsForUser = questions.map(q => {
      // Shuffle options for each question
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

      // Find correct answer index after shuffling
      const correctIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

      return {
        id: q._id,
        question: q.question,
        questionHindi: q.questionHindi,
        questionImage: q.questionImage,
        // Return shuffled options without isCorrect flag for security
        options: shuffledOptions.map(opt => ({
          text: opt.text,
          textHindi: opt.textHindi,
          image: opt.image
          // Note: isCorrect is intentionally removed for security
        })),
        correctAnswer: correctIndex, // Send correct index based on shuffled order
        marks: q.marks,
        negativeMark: q.negativeMark,
        difficulty: q.difficulty,
        subject: q.subject,
        topic: q.topic,
        questionType: q.questionType,
        language: q.language,
        explanation: q.explanation,
        explanationHindi: q.explanationHindi
      };
    });

    res.status(200).json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        duration: exam.duration,
        totalQuestions: questions.length,
        totalMarks: exam.totalMarks,
        negativeMarking: exam.negativeMarking,
        instructions: exam.instructions
      },
      questions: questionsForUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate exam
// @route   POST /api/exams/:id/rate
// @access  Private
exports.rateExam = async (req, res, next) => {
  try {
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Update ratings
    const currentAvg = exam.ratings.average;
    const currentCount = exam.ratings.count;
    
    const newCount = currentCount + 1;
    const newAvg = ((currentAvg * currentCount) + rating) / newCount;

    exam.ratings.average = Math.round(newAvg * 10) / 10;
    exam.ratings.count = newCount;

    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      ratings: exam.ratings
    });
  } catch (error) {
    next(error);
  }
};
