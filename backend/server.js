const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const {
  authRoutes,
  examRoutes,
  questionRoutes,
  resultRoutes,
  paymentRoutes,
  adminRoutes,
  admitCardRoutes,
  settingsRoutes,
  govResultsRoutes,
  sliderRoutes,
  courseRoutes,
  computerCourseExamRoutes,
  computerCourseQuestionRoutes,
  computerCourseResultRoutes,
  examCategoryRoutes,
  studyMaterialRoutes,
  latestJobRoutes,
  mediaRoutes,
  sarkariAdmitCardRoutes,
  faqRoutes,
  feedbackRoutes,
  couponRoutes,
  sarkariWorkRoutes
} = require('./routes');

// Connect to database
connectDB();

const app = express();

// Security middleware (configured to allow cross-origin images)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for dev)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Sarkari Spark API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admitcards', admitCardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/gov-results', govResultsRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/computer-course-exams', computerCourseExamRoutes);
app.use('/api/computer-course-questions', computerCourseQuestionRoutes);
app.use('/api/computer-course-results', computerCourseResultRoutes);
app.use('/api/exam-categories', examCategoryRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/latest-jobs', latestJobRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/sarkari-admit-cards', sarkariAdmitCardRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/sarkari-works', sarkariWorkRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
