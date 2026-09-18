const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  'uploads/profiles',
  'uploads/questions',
  'uploads/signatures',
  'uploads/exams',
  'uploads/admitcards',
  'uploads/materials',
  'uploads/courses',
  'uploads/others'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Determine folder based on file type
    if (file.fieldname === 'avatar' || file.fieldname === 'photo') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'questionImage' || file.fieldname === 'explanationImage') {
      uploadPath += 'questions/';
    } else if (file.fieldname === 'signature') {
      uploadPath += 'signatures/';
    } else if (file.fieldname === 'examImage') {
      uploadPath += 'exams/';
    } else if (file.fieldname === 'admitCard') {
      uploadPath += 'admitcards/';
    } else if (file.fieldname === 'file') {
      uploadPath += 'materials/';
    } else if (file.fieldname === 'courseImage') {
      uploadPath += 'courses/';
    } else {
      uploadPath += 'others/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types - images, documents, videos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|txt|mp4|webm|mov/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Allowed mime types
  const allowedMimeTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'video/mp4', 'video/webm', 'video/quicktime'
  ];
  
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, Office documents, text files, and videos are allowed'));
  }
};

// Configure upload for avatars (profile images) with 1MB limit
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB limit for avatars
  },
  fileFilter: (req, file, cb) => {
    // Only allow images for avatars
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed for profile pictures'));
    }
  }
});

// Configure upload for feedback photos with 50KB limit
const uploadFeedback = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 // 50KB limit for feedback photos
  },
  fileFilter: (req, file, cb) => {
    // Only allow images for feedback photos
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed for feedback photos'));
    }
  }
});

// Configure upload for general files (50MB limit for study materials)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for study materials
  },
  fileFilter: fileFilter
});

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      // Check if this is an avatar upload
      if (req.route && req.route.path === '/avatar') {
        return res.status(400).json({
          success: false,
          message: 'Profile image too large. Maximum size is 1MB.'
        });
      }
      // Check if this is a feedback photo upload
      if (req.originalUrl && req.originalUrl.includes('feedback')) {
        return res.status(400).json({
          success: false,
          message: 'Feedback photo too large. Maximum size is 50KB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

module.exports = {
  upload,
  uploadAvatar,
  uploadFeedback,
  handleUploadError
};
