const mongoose = require('mongoose');

const SliderSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  video: {
    type: String,
    required: false
  },
  videoDuration: {
    type: Number,
    required: false,
    default: 0
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  subtitle: {
    type: String,
    required: false,
    trim: true
  },
  redirectUrl: {
    type: String,
    required: false,
    trim: true
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

// Index for faster queries
SliderSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('Slider', SliderSchema);
