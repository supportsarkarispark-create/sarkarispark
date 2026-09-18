const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  subscriptionType: {
    type: String,
    enum: ['free', 'monthly', 'sixMonths', 'yearly', 'allExams', 'singleExam', 'customSelection', 'pro'],
    default: 'free'
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  profile: {
    education: String,
    city: String,
    state: String,
    targetExams: [String],
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    }
  },
  stats: {
    totalExamsAttempted: { type: Number, default: 0 },
    totalQuestionsSolved: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    wrongAnswers: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 }
  },
  weakTopics: [{
    topic: String,
    count: { type: Number, default: 1 }
  }],
  strongTopics: [{
    topic: String,
    count: { type: Number, default: 1 }
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  },
  currentSessionId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
