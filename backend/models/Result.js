const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOption: {
    type: Number,
    default: -1
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  marksObtained: {
    type: Number,
    default: 0
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true
  },
  answers: [answerSchema],
  totalQuestions: {
    type: Number,
    required: true
  },
  attemptedQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  wrongAnswers: {
    type: Number,
    default: 0
  },
  skippedQuestions: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  isTimeUp: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Passed', 'Failed', 'In Progress'],
    default: 'In Progress'
  },
  subjectWiseAnalysis: [{
    subject: String,
    totalQuestions: Number,
    correct: Number,
    wrong: Number,
    skipped: Number,
    accuracy: Number
  }],
  topicWiseAnalysis: [{
    topic: String,
    totalQuestions: Number,
    correct: Number,
    wrong: Number,
    skipped: Number,
    accuracy: Number
  }],
  weakTopics: [String],
  strongTopics: [String],
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  certificateGenerated: {
    type: Boolean,
    default: false
  },
  certificateUrl: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    required: true
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  }
});

// Calculate derived fields before saving
resultSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = (this.obtainedMarks / this.totalMarks) * 100;
  }
  
  // Calculate accuracy
  const totalAttempted = this.correctAnswers + this.wrongAnswers;
  if (totalAttempted > 0) {
    this.accuracy = (this.correctAnswers / totalAttempted) * 100;
  }
  
  // Determine status
  const exam = this.examId;
  // Note: This would need actual exam lookup to compare with passing marks
  // For now, we'll use a default passing percentage of 35%
  if (this.percentage >= 35) {
    this.status = 'Passed';
  } else {
    this.status = 'Failed';
  }
  
  next();
});

// Index for efficient queries
resultSchema.index({ userId: 1, submittedAt: -1 });
resultSchema.index({ examId: 1, percentage: -1 });

module.exports = mongoose.model('Result', resultSchema);
