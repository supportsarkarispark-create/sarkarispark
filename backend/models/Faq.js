const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide a question'],
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Please provide an answer'],
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

faqSchema.index({ question: 1, answer: 1 });

module.exports = mongoose.model('Faq', faqSchema);
