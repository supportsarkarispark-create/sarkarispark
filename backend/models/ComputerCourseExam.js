const mongoose = require('mongoose');

const computerCourseExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide exam title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID'],
    index: true
  },
  duration: {
    type: Number,
    required: [true, 'Please provide exam duration in minutes'],
    default: 60
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
    default: 100
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Please provide total number of questions'],
    default: 50
  },
  passingMarks: {
    type: Number,
    default: 35
  },
  accessType: {
    type: String,
    enum: ['free', 'login', 'premium'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

// Update updatedAt before saving
computerCourseExamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for course + order
computerCourseExamSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('ComputerCourseExam', computerCourseExamSchema);
