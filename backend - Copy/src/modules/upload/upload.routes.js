const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller');
const upload = require('../../middleware/upload');
const { protect, admin } = require('../../middleware/authMiddleware');

// Admin route for uploading images
router.post('/image', protect, admin, upload.single('image'), uploadController.uploadImage);

module.exports = router;
