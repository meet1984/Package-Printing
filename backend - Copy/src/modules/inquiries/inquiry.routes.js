const express = require('express');
const router = express.Router();
const inquiryController = require('./inquiry.controller');
const { protect, admin } = require('../../middleware/authMiddleware');
const uploadDoc = require('../../middleware/uploadDoc');

const rateLimit = require('express-rate-limit');

const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many quote requests from this IP, please try again after 15 minutes' }
});

// Public route (Submission)
router.post('/', quoteLimiter, uploadDoc.single('attachment'), inquiryController.createInquiry);

// Admin routes
router.get('/', protect, admin, inquiryController.getAllInquiries);
router.put('/:id/status', protect, admin, inquiryController.updateInquiryStatus);

module.exports = router;
