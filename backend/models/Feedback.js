const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  exam: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  testimonial: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
