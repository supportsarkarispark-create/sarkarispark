const express = require('express');
const router = express.Router();
const ComputerCourseExam = require('../models/ComputerCourseExam');
const ComputerCourseQuestion = require('../models/ComputerCourseQuestion');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/computer-course-exams/course/:courseId
// @desc    Get all exams for a specific course
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const exams = await ComputerCourseExam.find({ 
      courseId: req.params.courseId,
      isActive: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .select('title description duration totalQuestions totalMarks passingMarks accessType isActive order');

    res.json({
      success: true,
      exams: exams.map(exam => ({
        id: exam._id,
        title: exam.title,
        description: exam.description,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        accessType: exam.accessType,
        isActive: exam.isActive,
        order: exam.order
      }))
    });
  } catch (error) {
    console.error('Get computer course exams error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/computer-course-exams/:id
// @desc    Get single exam by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const exam = await ComputerCourseExam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        accessType: exam.accessType,
        isActive: exam.isActive,
        order: exam.order
      }
    });
  } catch (error) {
    console.error('Get computer course exam error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/computer-course-exams/:id/questions
// @desc    Get questions for a specific exam
// @access  Public
router.get('/:id/questions', async (req, res) => {
  try {
    const questions = await ComputerCourseQuestion.find({ 
      examId: req.params.id,
      isActive: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .select('question options correctOption explanation marks difficulty order');

    res.json({
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
        order: q.order
      }))
    });
  } catch (error) {
    console.error('Get computer course exam questions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/computer-course-exams
// @desc    Create new computer course exam
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, courseId, duration, totalQuestions, totalMarks, passingMarks, accessType, order } = req.body;

    const exam = await ComputerCourseExam.create({
      title,
      description,
      courseId,
      duration,
      totalQuestions,
      totalMarks,
      passingMarks,
      accessType,
      order,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        accessType: exam.accessType,
        isActive: exam.isActive,
        order: exam.order
      }
    });
  } catch (error) {
    console.error('Create computer course exam error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/computer-course-exams/:id
// @desc    Update computer course exam
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, courseId, duration, totalQuestions, totalMarks, passingMarks, accessType, isActive, order } = req.body;

    const exam = await ComputerCourseExam.findByIdAndUpdate(
      req.params.id,
      { title, description, courseId, duration, totalQuestions, totalMarks, passingMarks, accessType, isActive, order },
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.json({
      success: true,
      message: 'Exam updated successfully',
      exam: {
        id: exam._id,
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        duration: exam.duration,
        totalQuestions: exam.totalQuestions,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        accessType: exam.accessType,
        isActive: exam.isActive,
        order: exam.order
      }
    });
  } catch (error) {
    console.error('Update computer course exam error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/computer-course-exams/:id
// @desc    Delete computer course exam
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const exam = await ComputerCourseExam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Also delete all questions for this exam
    await ComputerCourseQuestion.deleteMany({ examId: req.params.id });

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete computer course exam error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
