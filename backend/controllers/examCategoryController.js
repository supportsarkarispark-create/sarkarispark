const { ExamCategory, Course, ComputerCourseExam, StudyMaterial } = require('../models');
const { validationResult } = require('express-validator');

// @desc    Get all categories (public)
// @route   GET /api/exam-categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await ExamCategory.find({ 
      isActive: true,
      parentId: null
    })
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        image: cat.image,
        order: cat.order,
        showInFooter: cat.showInFooter
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category with courses and exams
// @route   GET /api/exam-categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await ExamCategory.findById(req.params.id);

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get courses for this category
    const courses = await Course.find({
      categoryId: category._id,
      isActive: true
    }).sort({ createdAt: -1 });

    // Get exam count and study material count for each course
    const coursesWithData = await Promise.all(
      courses.map(async (course) => {
        const examCount = await ComputerCourseExam.countDocuments({
          courseId: course._id,
          isActive: true
        });

        const studyMaterialCount = await StudyMaterial.countDocuments({
          courseId: course._id,
          isActive: true
        });

        return {
          id: course._id,
          title: course.title,
          description: course.description,
          image: course.image,
          examCount,
          studyMaterialCount
        };
      })
    );

    // Get parent exams and pyqs for this category
    const { Exam } = require('../models');
    
    // Check all exams in this category for debugging
    const allCategoryExams = await Exam.find({ category: category.name });
    
    // Parent exams (not PYQ)
    const parentExams = await Exam.find({
      category: category.name,
      isActive: true,
      parentExamId: null,
      isPYQ: false
    })
      .select('title description duration totalQuestions totalMarks difficulty rating isPremium image')
      .sort({ createdAt: -1 });

    // Parent PYQs
    const parentPyqs = await Exam.find({
      category: category.name,
      isActive: true,
      parentExamId: null,
      isPYQ: true
    })
      .select('title description duration totalQuestions totalMarks difficulty rating isPremium image')
      .sort({ createdAt: -1 });

    // Get test counts for each parent exam
    const examsWithTestCount = await Promise.all(
      parentExams.map(async (exam) => {
        const examIdStr = exam._id.toString();
        const testCount = await Exam.countDocuments({
          $or: [
            { parentExamId: exam._id },
            { parentExamId: examIdStr }
          ],
          isActive: true
        });
        return {
          id: exam._id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          totalMarks: exam.totalMarks,
          difficulty: exam.difficulty,
          rating: exam.rating,
          isPremium: exam.isPremium,
          image: exam.image,
          testCount
        };
      })
    );

    // Get test counts for each parent PYQ
    const pyqsWithTestCount = await Promise.all(
      parentPyqs.map(async (pyq) => {
        const pyqIdStr = pyq._id.toString();
        const testCount = await Exam.countDocuments({
          $or: [
            { parentExamId: pyq._id },
            { parentExamId: pyqIdStr }
          ],
          isActive: true
        });
        return {
          id: pyq._id,
          title: pyq.title,
          description: pyq.description,
          duration: pyq.duration,
          totalQuestions: pyq.totalQuestions,
          totalMarks: pyq.totalMarks,
          difficulty: pyq.difficulty,
          rating: pyq.rating,
          isPremium: pyq.isPremium,
          image: pyq.image,
          testCount
        };
      })
    );

    res.status(200).json({
      success: true,
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        image: category.image,
        showInFooter: category.showInFooter
      },
      courses: coursesWithData,
      exams: examsWithTestCount,
      pyqs: pyqsWithTestCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/exam-categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    req.body.createdBy = req.user.id;

    const category = await ExamCategory.create(req.body);

    res.status(201).json({
      success: true,
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        order: category.order,
        isActive: category.isActive,
        showInFooter: category.showInFooter
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/exam-categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await ExamCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category = await ExamCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        order: category.order,
        isActive: category.isActive,
        showInFooter: category.showInFooter
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/exam-categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await ExamCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { Exam } = require('../models');
    const categoryName = category.name;

    try {
      // Delete all exams, PYQs and tests in this category
      const deleteResult = await Exam.deleteMany({ category: categoryName });

      // Delete the category
      await category.deleteOne();

      res.status(200).json({
        success: true,
        message: `Category deleted successfully. ${deleteResult.deletedCount} exams/tests were also removed.`,
        deletedExams: deleteResult.deletedCount
      });
    } catch (deleteError) {
      console.error('[ERROR] Failed to delete category or exams:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category: ' + (deleteError.message || 'Unknown error')
      });
    }
  } catch (error) {
    console.error('[ERROR] deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category'
    });
  }
};

// @desc    Toggle category status (Admin only)
// @route   PATCH /api/exam-categories/:id/toggle
// @access  Private/Admin
exports.toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await ExamCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      isActive: category.isActive,
      message: `Category ${category.isActive ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories for admin
// @route   GET /api/exam-categories/admin/all
// @access  Private/Admin
exports.getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const models = require('../models');
    const Exam = models.Exam;
    
    // Get all categories
    const categories = await ExamCategory.find()
      .populate('createdBy', 'name')
      .sort({ order: 1, createdAt: -1 });

    // Get exam counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        try {
          // First, check if any exams exist with this category (any status)
          const allExamsInCategory = await Exam.find({ category: cat.name }).select('title isActive parentExamId isPYQ');
          
          // Count parent exams (not PYQ) - handle both null and undefined
          const examQuery = {
            category: cat.name,
            isActive: true,
            $or: [
              { parentExamId: null },
              { parentExamId: { $exists: false } }
            ],
            isPYQ: false
          };
          const examCount = await Exam.countDocuments(examQuery);
          
          // Count PYQ groups
          const pyqQuery = {
            category: cat.name,
            isActive: true,
            $or: [
              { parentExamId: null },
              { parentExamId: { $exists: false } }
            ],
            isPYQ: true
          };
          const pyqCount = await Exam.countDocuments(pyqQuery);
          
          // Count total tests under this category (has parentExamId)
          const testQuery = {
            category: cat.name,
            isActive: true,
            parentExamId: { $exists: true, $ne: null }
          };
          const testCount = await Exam.countDocuments(testQuery);

          return {
            id: cat._id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            image: cat.image,
            order: cat.order,
            isActive: cat.isActive,
            showInFooter: cat.showInFooter,
            createdAt: cat.createdAt,
            createdBy: cat.createdBy,
            examCount: examCount || 0,
            pyqCount: pyqCount || 0,
            testCount: testCount || 0
          };
        } catch (err) {
          console.error(`[ERROR] Counting exams for ${cat.name}:`, err);
          // If counting fails for this category, return with zeros
          return {
            id: cat._id,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            image: cat.image,
            order: cat.order,
            isActive: cat.isActive,
            showInFooter: cat.showInFooter,
            createdAt: cat.createdAt,
            createdBy: cat.createdBy,
            examCount: 0,
            pyqCount: 0,
            testCount: 0
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: categories.length,
      categories: categoriesWithCounts
    });
  } catch (error) {
    console.error('[ERROR] getAllCategoriesAdmin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
};

// @desc    Create course for a category (Admin only)
// @route   POST /api/exam-categories/:id/courses
// @access  Private/Admin
exports.createCategoryCourse = async (req, res, next) => {
  try {
    const category = await ExamCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Handle image - either from file upload or URL
    let image = req.body.image;
    if (req.file) {
      image = `/uploads/courses/${req.file.filename}`;
    }

    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      image: image,
      categoryId: category._id,
      isActive: req.body.isActive !== false,
      createdBy: req.user.id
    });

    res.status(201).json({
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
    next(error);
  }
};

// @desc    Get courses for a category
// @route   GET /api/exam-categories/:id/courses
// @access  Public
exports.getCategoryCourses = async (req, res, next) => {
  try {
    const category = await ExamCategory.findById(req.params.id);

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const courses = await Course.find({
      categoryId: category._id,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        image: course.image,
        isActive: course.isActive
      }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course (Admin only)
// @route   PUT /api/exam-categories/courses/:courseId
// @access  Private/Admin
exports.updateCategoryCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Handle image - either from file upload or URL
    let updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/courses/${req.file.filename}`;
    }

    course = await Course.findByIdAndUpdate(
      req.params.courseId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
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
    next(error);
  }
};

// @desc    Delete course (Admin only)
// @route   DELETE /api/exam-categories/courses/:courseId
// @access  Private/Admin
exports.deleteCategoryCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
