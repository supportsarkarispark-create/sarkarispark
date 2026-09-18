const mongoose = require('mongoose');

const courseExamSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide exam title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Please provide exam ID'],
    index: true
  },
  order: {
    type: Number,
    default: 0,
    description: 'Order of exam within the course'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
courseExamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for unique exam per course
courseExamSchema.index({ courseId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('CourseExam', courseExamSchema);
