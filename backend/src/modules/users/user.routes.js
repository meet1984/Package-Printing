const express = require('express');
const router = express.Router();
const ctrl = require('./user.controller');
const { protect, admin } = require('../../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Public routes
router.post('/register', authLimiter, ctrl.register);
router.post('/verify-otp', authLimiter, ctrl.verifyOTP);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', ctrl.logout);

// Protected routes (handled internally without returning 401)
router.get('/me', ctrl.getMe);

// Admin only routes
router.get('/admin', protect, admin, ctrl.adminGetUsers);

module.exports = router;
