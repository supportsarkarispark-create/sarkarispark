const mongoose = require('mongoose');

const admitCardSchema = new mongoose.Schema({
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
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    default: 'General'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  signature: {
    type: String,
    default: null
  },
  examDetails: {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    reportingTime: { type: String, required: true },
    examTime: { type: String, required: true },
    duration: { type: Number, required: true },
    venue: {
      centerName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    }
  },
  instructions: [{
    type: String
  }],
  itemsToBring: [{
    type: String
  }],
  downloadLink: {
    type: String,
    default: null
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  downloadedAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  isGenerated: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Date,
    default: null
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled'],
    default: 'draft'
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
admitCardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for unique admit cards per user per exam
admitCardSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('AdmitCard', admitCardSchema);
