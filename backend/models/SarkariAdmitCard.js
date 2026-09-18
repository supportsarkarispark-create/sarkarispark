const mongoose = require('mongoose');

const sarkariAdmitCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide title'],
    trim: true
  },
  postName: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  descriptionText: {
    type: String,
    trim: true
  },
  descriptionImage: {
    type: String,
    trim: true
  },
  admitCardReleaseDate: {
    type: Date,
    required: [true, 'Please provide admit card release date']
  },
  lastDateToDownload: {
    type: Date
  },
  downloadLink: {
    type: String,
    required: [true, 'Please provide download link'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isLatest: {
    type: Boolean,
    default: false
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
  }
});

// Update timestamps
sarkariAdmitCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
sarkariAdmitCardSchema.index({ title: 'text', postName: 'text' });
sarkariAdmitCardSchema.index({ isActive: 1, admitCardReleaseDate: -1 });
sarkariAdmitCardSchema.index({ isLatest: 1, isActive: 1 });

module.exports = mongoose.model('SarkariAdmitCard', sarkariAdmitCardSchema);
