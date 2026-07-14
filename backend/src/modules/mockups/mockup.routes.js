const express = require('express');
const router = express.Router();
const mockupController = require('./mockup.controller');
const upload = require('../../middleware/upload');
const { protect } = require('../../middleware/authMiddleware');

router.post('/render', protect, upload.single('designImage'), mockupController.renderMockup);

module.exports = router;
