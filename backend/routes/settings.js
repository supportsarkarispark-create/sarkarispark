const express = require('express');
const router = express.Router();
const { settingsController } = require('../controllers');
const { protect, adminOnly } = require('../middleware/auth');

// Public route - Get settings
router.get('/', settingsController.getSettings);

// Admin only - Update settings
router.put('/', protect, adminOnly, settingsController.updateSettings);

module.exports = router;
