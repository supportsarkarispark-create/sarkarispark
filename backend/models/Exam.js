const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Please provide exam category'],
    index: true
  },
  subCategory: {
    type: String,
    trim: true
  },
  examType: {
    type: String,
    enum: ['MCQ', 'Typing', 'Practical', 'Mock'],
    default: 'MCQ'
  },
  parentExamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: null,
    index: true
  },
  isPYQ: {
    type: Boolean,
    default: false
  },
  testNumber: {
    type: Number,
    default: 1
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  pricing: {
    type: {
      oneTime: {
        price: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
      },
      monthly: {
        price: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false }
      },
      yearly: {
        price: { type: Number, default: 0 },
        discountPrice: { type: Number, default: 0 },
        isActive: { type: Boolean, default: false }
      }
    },
    default: {
      oneTime: { price: 0, discountPrice: 0, isActive: true },
      monthly: { price: 0, discountPrice: 0, isActive: false },
      yearly: { price: 0, discountPrice: 0, isActive: false }
    }
  },
  // Legacy fields for backward compatibility
  price: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
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
  passingMarks: {
    type: Number,
    default: 35
  },
  negativeMarking: {
    type: Number,
    default: 0,
    description: 'Negative marking per wrong answer (e.g., 0.25)'
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Please provide total number of questions'],
    default: 100
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
    default: 'Mixed'
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Both'],
    default: 'English'
  },
  instructions: [{
    type: String
  }],
  syllabus: [{
    topic: String,
    weightage: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  resultPublishDate: {
    type: Date,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  tags: [{
    type: String
  }],
  attempts: {
    type: Number,
    default: 0
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
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
examSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
examSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Exam', examSchema);
