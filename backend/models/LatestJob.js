const mongoose = require('mongoose');

const latestJobSchema = new mongoose.Schema({
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
  organization: {
    type: String,
    required: [true, 'Organization is required'],
    trim: true,
    maxlength: [100, 'Organization cannot be more than 100 characters']
  },
  image: {
    type: String,
    default: null
  },
  link: {
    type: String,
    required: [true, 'External link is required'],
    trim: true
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  lastDate: {
    type: Date,
    required: [true, 'Last date to apply is required']
  },
  category: {
    type: String,
    enum: ['SSC', 'Banking', 'Railway', 'UPSC', 'State', 'Defence', 'Teaching', 'Other'],
    default: 'Other'
  },
  isLatest: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
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
latestJobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
latestJobSchema.index({ createdAt: -1 });
latestJobSchema.index({ category: 1, createdAt: -1 });
latestJobSchema.index({ isLatest: 1, createdAt: -1 });
latestJobSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('LatestJob', latestJobSchema);
