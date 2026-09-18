const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Hero Section Stats
  heroStats: {
    activeStudents: { type: String, default: '1L+' },
    mockTests: { type: String, default: '500+' },
    questions: { type: String, default: '50K+' },
    selections: { type: String, default: '10K+' }
  },
  
  // Exam Categories
  examCategories: [{
    name: { type: String, required: true },
    count: { type: String, required: true },
    color: { type: String, default: 'from-blue-500 to-blue-600' }
  }],

  // Popular Exams Carousel
  popularExams: [{
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    logo: { type: String, default: '' },
    isPopular: { type: Boolean, default: false },
    mockTestCount: { type: String, default: '0' },
    attempts: { type: String, default: '0' },
    questionsCount: { type: String, default: '0' },
    maxMarks: { type: String, default: '0' },
    timeMinutes: { type: String, default: '0' },
    link: { type: String, default: '' },
    color: { type: String, default: 'from-purple-500 to-blue-500' },
    order: { type: Number, default: 0 }
  }],
  
  // Hero Badge Text
  heroBadge: {
    type: String,
    default: 'Trusted by 1,00,000+ Students'
  },
  
  // Hero Title
  heroTitle: {
    line1: { type: String, default: 'Crack Your Dream' },
    line2: { type: String, default: ' Government Job' }
  },
  
  // Hero Description
  heroDescription: {
    type: String,
    default: 'Prepare for SSC, Banking, Railway, and State Exams with our comprehensive mock tests, detailed analytics, and expert-curated content.'
  },

  // About Section
  aboutSection: {
    title: {
      type: String,
      default: 'About Sarkari Spark'
    },
    subtitle: {
      type: String,
      default: 'Empowering Aspirants, Building Futures'
    },
    description: {
      type: String,
      default: 'Sarkari Spark is India\'s premier online platform for government exam preparation. We provide comprehensive mock tests, study materials, and expert guidance to help aspirants crack SSC, Banking, Railway, and State-level examinations.'
    },
    founder: {
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      image: { type: String, default: '' },
      description: { type: String, default: '' }
    },
    mission: {
      title: { type: String, default: 'Our Mission' },
      content: {
        type: String,
        default: 'To democratize access to quality education and provide every aspirant with the tools, resources, and guidance needed to achieve their dream government job. We believe in making exam preparation affordable, accessible, and effective for everyone.'
      }
    },
    vision: {
      title: { type: String, default: 'Our Vision' },
      content: {
        type: String,
        default: 'To become India\'s most trusted and comprehensive platform for government exam preparation, helping millions of students transform their aspirations into reality through innovative learning solutions and personalized guidance.'
      }
    },
    values: [{
      icon: { type: String, default: 'Target' },
      title: { type: String, required: true },
      description: { type: String, required: true }
    }],
    stats: {
      yearsExperience: { type: String, default: '5+' },
      studentsHelped: { type: String, default: '100K+' },
      successRate: { type: String, default: '85%' },
      expertFaculty: { type: String, default: '50+' }
    },
    team: [{
      name: { type: String, required: true },
      role: { type: String, required: true },
      image: { type: String, default: '' },
      bio: { type: String, default: '' }
    }],
    features: [{
      icon: { type: String, default: 'CheckCircle' },
      title: { type: String, required: true },
      description: { type: String, required: true }
    }],
    journey: {
      title: { type: String, default: 'Our Journey' },
      milestones: [{
        year: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true }
      }]
    }
  },

  // Contact Information
  contactInfo: {
    email: { type: String, default: 'support@sarkarispark.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: 'New Delhi, India' },
    whatsapp: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    telegram: { type: String, default: '' }
  },

  // Subscription Pricing
  subscriptionPricing: {
    // Plan 1: Single Exam (Per Exam)
    singleExam: {
      monthly: {
        price: { type: Number, default: 99 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to 1 selected exam' }]
      },
      sixMonths: {
        price: { type: Number, default: 249 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to 1 selected exam' }]
      },
      yearly: {
        price: { type: Number, default: 399 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to 1 selected exam' }]
      }
    },
    // Plan 2: Custom Selection (Pay per selected exam)
    customSelection: {
      monthly: {
        pricePerExam: { type: Number, default: 79 },
        minExams: { type: Number, default: 2 },
        maxExams: { type: Number, default: 10 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Select multiple exams' }]
      },
      sixMonths: {
        pricePerExam: { type: Number, default: 199 },
        minExams: { type: Number, default: 2 },
        maxExams: { type: Number, default: 10 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Select multiple exams' }]
      },
      yearly: {
        pricePerExam: { type: Number, default: 349 },
        minExams: { type: Number, default: 2 },
        maxExams: { type: Number, default: 10 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Select multiple exams' }]
      }
    },
    // Plan 3: All Exams Access
    allExams: {
      monthly: {
        price: { type: Number, default: 299 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to all premium exams' }]
      },
      sixMonths: {
        price: { type: Number, default: 799 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to all premium exams' }]
      },
      yearly: {
        price: { type: Number, default: 1499 },
        discountPrice: { type: Number, default: null },
        isActive: { type: Boolean, default: true },
        features: [{ type: String, default: 'Access to all premium exams' }]
      }
    }
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);
