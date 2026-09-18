const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const ComputerCourseExam = require('../models/ComputerCourseExam');
const ComputerCourseQuestion = require('../models/ComputerCourseQuestion');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/courses/computer
// @desc    Get all computer courses with exam counts (independent courses only)
// @access  Public
router.get('/computer', async (req, res) => {
  try {
    const courses = await Course.find({ 
      isActive: true,
      categoryId: null  // Only get independent courses, not category-linked courses
    })
      .sort({ createdAt: -1 })
      .select('title description image isActive createdAt');

    // Get exam counts for each course
    const courseIds = courses.map(c => c._id);
    const examCounts = await ComputerCourseExam.aggregate([
      { $match: { courseId: { $in: courseIds }, isActive: true } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);

    const examCountMap = {};
    examCounts.forEach(item => {
      examCountMap[item._id.toString()] = item.count;
    });

    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive,
        createdAt: course.createdAt
      })),
      examCounts: examCountMap
    });
  } catch (error) {
    console.error('Get computer courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses
// @desc    Get all courses with pagination (public - independent courses only)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query - only independent courses (categoryId: null)
    const query = { 
      isActive: true,
      categoryId: null  // Only get independent courses, not category-linked courses
    };

    // Add search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Get exam counts for each course
    const courseIds = courses.map(c => c._id);
    const examCountMap = {};
    
    if (courseIds.length > 0) {
      try {
        const exams = await ComputerCourseExam.find({ 
          courseId: { $in: courseIds }, 
          isActive: true 
        });
        
        exams.forEach(exam => {
          const courseId = exam.courseId.toString();
          examCountMap[courseId] = (examCountMap[courseId] || 0) + 1;
        });
      } catch (aggError) {
        console.error('Error fetching exam counts:', aggError);
      }
    }

    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive,
        createdAt: course.createdAt
      })),
      examCounts: examCountMap,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// @route   GET /api/courses/admin
// @desc    Get all courses with pagination (admin - category-linked courses only)
// @access  Admin only
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query - only category-linked courses (categoryId is not null)
    const query = { 
      categoryId: { $ne: null, $exists: true }  // Only category-linked courses
    };

    // Add search if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Get exam counts for each course
    const courseIds = courses.map(c => c._id);
    const examCountMap = {};
    
    if (courseIds.length > 0) {
      try {
        const exams = await ComputerCourseExam.find({ 
          courseId: { $in: courseIds }, 
          isActive: true 
        });
        
        exams.forEach(exam => {
          const courseId = exam.courseId.toString();
          examCountMap[courseId] = (examCountMap[courseId] || 0) + 1;
        });
      } catch (aggError) {
        console.error('Error fetching exam counts:', aggError);
      }
    }

    res.json({
      success: true,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive,
        createdAt: course.createdAt
      })),
      examCounts: examCountMap,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, image, categoryId, isActive } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    const courseData = {
      title,
      description: description || '',
      image: image || null,
      categoryId: categoryId || null,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive
      }
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, image, categoryId, isActive } = req.body;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, image, categoryId, isActive },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive
      }
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Also delete all exams and questions for this course
    await ComputerCourseExam.deleteMany({ courseId: req.params.id });
    const examIds = await ComputerCourseExam.find({ courseId: req.params.id }).select('_id');
    await ComputerCourseQuestion.deleteMany({ examId: { $in: examIds } });

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
