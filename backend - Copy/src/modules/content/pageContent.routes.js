const express = require('express');
const router = express.Router();
const pageContentController = require('./pageContent.controller');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public route
router.get('/:key', pageContentController.getPageContent);

// Admin route
router.put('/:key', protect, admin, pageContentController.updatePageContent);

module.exports = router;
