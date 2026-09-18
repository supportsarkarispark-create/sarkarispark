const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide material title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please provide course ID'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Please provide material type'],
    enum: ['PYQ', 'Notes', 'Syllabus', 'Ebook', 'Video', 'PDF', 'Doc', 'Other'],
    default: 'PDF'
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide file URL']
  },
  fileSize: {
    type: Number,
    default: 0
  },
  fileType: {
    type: String,
    default: 'application/pdf'
  },
  thumbnail: {
    type: String,
    default: null
  },
  year: {
    type: Number,
    default: null
  },
  language: {
    type: String,
    enum: ['Hindi', 'English', 'Both'],
    default: 'English'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
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
studyMaterialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for course + type + order
studyMaterialSchema.index({ courseId: 1, type: 1, order: 1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
