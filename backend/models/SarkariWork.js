const mongoose = require('mongoose');

const sarkariWorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Update timestamp on save
sarkariWorkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
sarkariWorkSchema.index({ createdAt: -1 });
sarkariWorkSchema.index({ category: 1, order: 1 });
sarkariWorkSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('SarkariWork', sarkariWorkSchema);
