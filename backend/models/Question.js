const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true
  },
  // English Content
  question: {
    type: String,
    required: [true, 'Please provide question text'],
    maxlength: [1000, 'Question cannot be more than 1000 characters']
  },
  questionImage: {
    type: String,
    default: null
  },
  // Hindi Content
  questionHindi: {
    type: String,
    maxlength: [1000, 'Question cannot be more than 1000 characters'],
    default: null
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    textHindi: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Please provide correct answer index'],
    min: 0,
    max: 5
  },
  explanation: {
    type: String,
    maxlength: [2000, 'Explanation cannot be more than 2000 characters']
  },
  explanationHindi: {
    type: String,
    maxlength: [2000, 'Explanation cannot be more than 2000 characters'],
    default: null
  },
  explanationImage: {
    type: String,
    default: null
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMark: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  subject: {
    type: String,
    trim: true,
    index: true
  },
  topic: {
    type: String,
    trim: true,
    index: true
  },
  subTopic: {
    type: String,
    trim: true
  },
  tags: [{
    type: String
  }],
  language: {
    type: String,
    enum: ['English', 'Hindi'],
    default: 'English'
  },
  questionType: {
    type: String,
    enum: ['Single Choice', 'Multiple Choice', 'True/False', 'Fill in Blank'],
    default: 'Single Choice'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  statistics: {
    totalAttempts: { type: Number, default: 0 },
    correctAttempts: { type: Number, default: 0 },
    wrongAttempts: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }
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
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate accuracy before saving
questionSchema.pre('save', function(next) {
  if (this.statistics.totalAttempts > 0) {
    this.statistics.accuracy = (this.statistics.correctAttempts / this.statistics.totalAttempts) * 100;
  }
  next();
});

// Index for search
questionSchema.index({ question: 'text', subject: 'text', topic: 'text' });

module.exports = mongoose.model('Question', questionSchema);
