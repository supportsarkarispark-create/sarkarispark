const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');
const Media = require('../models/Media');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp, svg)'), false);
  }
};

// Regular upload for admin media (5MB limit)
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload for feedback photos (50KB limit)
const uploadFeedbackPhoto = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 } // 50KB limit for feedback photos
});

// @route   POST /api/media/upload
// @desc    Upload single or multiple images
// @access  Admin only
router.post('/upload', protect, adminOnly, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedMedia = [];

    for (const file of req.files) {
      const media = new Media({
        filename: file.filename,
        originalName: file.originalname,
        path: `/uploads/media/${file.filename}`,
        url: `/uploads/media/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
        folder: req.body.folder || 'general',
        altText: req.body.altText || '',
        uploadedBy: req.user.id
      });

      await media.save();
      uploadedMedia.push(media);
    }

    res.json({
      success: true,
      message: `${uploadedMedia.length} image(s) uploaded successfully`,
      media: uploadedMedia
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// @route   POST /api/media/upload-feedback-photo
// @desc    Upload feedback photo with 50KB limit
// @access  Public (for feedback submissions)
router.post('/upload-feedback-photo', uploadFeedbackPhoto.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const media = new Media({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/media/${req.file.filename}`,
      url: `/uploads/media/${req.file.filename}`,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: req.body.folder || 'feedback-avatars',
      altText: req.body.altText || '',
    });

    await media.save();

    res.json({
      success: true,
      message: 'Feedback photo uploaded successfully',
      media: media,
      url: media.url
    });
  } catch (error) {
    console.error('Feedback photo upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload feedback photo' 
    });
  }
});

// @route   GET /api/media
// @desc    Get all media with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const folder = req.query.folder || null;

    const query = {};
    if (folder) query.folder = folder;

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const total = await Media.countDocuments(query);

    res.json({
      success: true,
      media,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// @route   GET /api/media/images
// @desc    Get all image URLs for media library
// @access  Public
router.get('/images', async (req, res) => {
  try {
    const media = await Media.find({})
      .select('url path')
      .sort({ createdAt: -1 });
    
    const images = media.map(m => m.url || m.path);
    
    res.json({
      success: true,
      images
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// @route   GET /api/media/folders
// @desc    Get all unique folders
// @access  Public
router.get('/folders', async (req, res) => {
  try {
    const folders = await Media.distinct('folder');
    res.json({
      success: true,
      folders
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// @route   DELETE /api/media/:id
// @desc    Delete a media item
// @access  Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', media.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.deleteOne();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// @route   PUT /api/media/:id
// @desc    Update media metadata
// @access  Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { altText, folder } = req.body;
    
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { altText, folder },
      { new: true }
    );

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json({
      success: true,
      media
    });
  } catch (error) {
    console.error('Update media error:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

module.exports = router;
