const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    default: null,
    index: true,
    sparse: true
  },
  signature: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  planType: {
    type: String,
    enum: ['monthly', 'yearly', 'exam_purchase', 'custom', 'singleExam', 'customSelection', 'allExams'],
    required: true
  },
  planDetails: {
    planType: String,
    duration: String,
    examCount: Number,
    selectedExams: [mongoose.Schema.Types.ObjectId]
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'upi', 'wallet', 'emi', 'paylater'],
    default: null
  },
  description: {
    type: String
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: null
  },
  examAccess: {
    examIds: [mongoose.Schema.Types.ObjectId],
    accessType: String,
    accessStartDate: {
      type: Date,
      default: Date.now
    },
    accessEndDate: {
      type: Date,
      default: null
    },
    durationMonths: {
      type: Number,
      default: 0
    }
  },
  invoice: {
    number: String,
    url: String,
    generatedAt: Date
  },
  metadata: {
    razorpayResponse: mongoose.Schema.Types.Mixed,
    notes: mongoose.Schema.Types.Mixed
  },
  refundDetails: {
    amount: Number,
    reason: String,
    status: String,
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  couponCode: {
    type: String,
    default: null
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  failedAt: {
    type: Date,
    default: null
  }
});

// Update timestamps based on status
paymentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = Date.now();
    } else if (this.status === 'failed' && !this.failedAt) {
      this.failedAt = Date.now();
    }
  }
  next();
});

// Index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
