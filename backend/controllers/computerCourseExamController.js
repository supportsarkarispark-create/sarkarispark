const { ComputerCourseExam, ComputerCourseQuestion } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Get all exams for a course
// @route   GET /api/computer-course-exams/course/:courseId
// @access  Public
exports.getCourseExams = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    const exams = await ComputerCourseExam.find({ 
      courseId, 
      isActive: true 
    })
      .sort({ order: 1, createdAt: -1 });

    // Get question count for each exam
    const examsWithQuestionCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await ComputerCourseQuestion.countDocuments({ 
          examId: exam._id 
        });
        return {
          ...exam.toObject(),
          availableQuestions: questionCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: exams.length,
      exams: examsWithQuestionCount.map(exam => ({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        passingMarks: exam.passingMarks,
        availableQuestions: exam.availableQuestions,
        accessType: exam.accessType,
        order: exam.order,
        isActive: exam.isActive,
        createdAt: exam.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam
// @route   GET /api/computer-course-exams/:id
// @access  Public
exports.getExam = async (req, res, next) => {
  try {
    const exam = await ComputerCourseExam.findById(req.params.id);

    if (!exam || !exam.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Get question count
    const questionCount = await ComputerCourseQuestion.countDocuments({ examId: exam._id });

    res.status(200).json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        passingMarks: exam.passingMarks,
        availableQuestions: questionCount,
        accessType: exam.accessType,
        order: exam.order,
        isActive: exam.isActive,
        createdAt: exam.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams for admin
// @route   GET /api/computer-course-exams/admin/all
// @access  Private/Admin
exports.getAllExamsAdmin = async (req, res, next) => {
  try {
    const exams = await ComputerCourseExam.find()
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams: exams.map(exam => ({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId?._id,
        courseTitle: exam.courseId?.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        totalQuestions: exam.totalQuestions,
        passingMarks: exam.passingMarks,
        accessType: exam.accessType,
        order: exam.order,
        isActive: exam.isActive,
        createdAt: exam.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create exam (Admin only)
// @route   POST /api/computer-course-exams
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

    const exam = await ComputerCourseExam.create(req.body);

    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam (Admin only)
// @route   PUT /api/computer-course-exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    let exam = await ComputerCourseExam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam = await ComputerCourseExam.findByIdAndUpdate(
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
// @route   DELETE /api/computer-course-exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await ComputerCourseExam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Delete all questions first
    const { ComputerCourseQuestion } = require('../models');
    await ComputerCourseQuestion.deleteMany({ examId: exam._id });
    
    // Delete the exam
    await exam.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle exam status (Admin only)
// @route   PATCH /api/computer-course-exams/:id/toggle
// @access  Private/Admin
exports.toggleExamStatus = async (req, res, next) => {
  try {
    const exam = await ComputerCourseExam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam.isActive = !exam.isActive;
    await exam.save();

    res.status(200).json({
      success: true,
      isActive: exam.isActive,
      message: `Exam ${exam.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};
