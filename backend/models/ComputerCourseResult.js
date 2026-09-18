const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComputerCourseQuestion',
    required: true
  },
  selectedOption: {
    type: Number,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  marksObtained: {
    type: Number,
    default: 0
  }
});

const computerCourseResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user ID'],
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComputerCourseExam',
    required: [true, 'Please provide exam ID'],
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID'],
    index: true
  },
  answers: {
    type: [answerSchema],
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answeredQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  wrongAnswers: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

computerCourseResultSchema.index({ userId: 1, examId: 1 });
computerCourseResultSchema.index({ userId: 1, completedAt: -1 });
computerCourseResultSchema.index({ examId: 1, percentage: -1 });

module.exports = mongoose.model('ComputerCourseResult', computerCourseResultSchema);
