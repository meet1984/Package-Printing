const express = require('express');
const router = express.Router();
const mockupController = require('./mockup.controller');
const upload = require('../../middleware/upload');
const { protect } = require('../../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

// Canvas compositing (sharp/@napi-rs/canvas) is CPU/memory intensive per request,
// so this gets a tighter cap than the general API limiter to prevent resource exhaustion.
const renderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 renders per authenticated user's IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many mockup render requests, please try again later.' }
});

router.post('/render', protect, renderLimiter, upload.single('designImage'), mockupController.renderMockup);

module.exports = router;
