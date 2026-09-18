const mongoose = require('mongoose');

const examCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: 'blue'
  },
  image: {
    type: String,
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  showInFooter: {
    type: Boolean,
    default: false
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamCategory',
    default: null
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
examCategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for parent-child relationship
examCategorySchema.index({ parentId: 1, order: 1 });

module.exports = mongoose.model('ExamCategory', examCategorySchema);
