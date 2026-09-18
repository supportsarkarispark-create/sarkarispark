const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const computerCourseQuestionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComputerCourseExam',
    required: [true, 'Please provide exam ID'],
    index: true
  },
  question: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(v) {
        return v && v.length >= 2 && v.length <= 4;
      },
      message: 'Options must be between 2 and 4'
    }
  },
  correctOption: {
    type: Number,
    required: [true, 'Please provide correct option index'],
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
computerCourseQuestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for exam + order
computerCourseQuestionSchema.index({ examId: 1, order: 1 });

module.exports = mongoose.model('ComputerCourseQuestion', computerCourseQuestionSchema);
