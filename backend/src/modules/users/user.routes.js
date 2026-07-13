const express = require('express');
const router = express.Router();
const ctrl = require('./user.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public routes
router.post('/register', ctrl.register);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// Protected routes (both customer and admin)
router.get('/me', protect, ctrl.getMe);

// Admin only routes
router.get('/admin', protect, admin, ctrl.adminGetUsers);

module.exports = router;
